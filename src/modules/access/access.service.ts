import httpStatus from "http-status";
import { ApiError } from "../errors";
import { AccessCard } from "../accessCard";
import { IAccess } from "./access.interfaces";
import { Employee } from "../employee";
import { createAccessLog } from "../accessLog/accessLog.service";
import { Company } from "../company";
import { IEmployeeDoc } from "../employee/employee.interfaces";
// import { AccessLevel } from "../accessLevel";
import { IAccessLog } from "../accessLog/accessLog.interfaces";

export const accessService = async (accessBody: IAccess): Promise<string | IAccessLog> => {
    const accessCard = await AccessCard.findById(accessBody.accessCardId);
    if (!accessCard) {
        throw new ApiError(httpStatus.NOT_FOUND, 'AccessCard not found');
    }

    // Check if access card is valid
    if (!accessCard.is_active || (accessCard.valid_until && accessCard.valid_until < new Date())) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'AccessCard is not active or has expired');
    }

    const employee = await Employee.findById(accessCard.cardHolder.employeeId);
    if (!employee) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Employee not found');
    }

    if (!(await Company.findOne({ _id: accessBody.companyId, "buildings.buildingId": accessBody.buildingId }))) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Invalid company or building')
    }

    // get employee permissions
    const permissionArray: { type: string, permissions: { resource: string, action: string }[] }[] = [
        {
            type: 'company',
            permissions: []
        },
        {
            type: 'building',
            permissions: []
        },
        {
            type: 'product',
            permissions: []
        }
    ]
    // if (accessBody.resource) {
    //     await Promise.all(employee.accessLevels.map(async (permission) => {
    //         const permissionExists = await AccessLevel.findOne({ name: permission.accessLevel })
    //         if (!permissionExists) {
    //             throw new ApiError(httpStatus.NOT_FOUND, 'Permission not found')
    //         }

    //         // console.log(permissionExists)

    //         if (permissionExists.type === 'company') {
    //             permissionArray[0]?.permissions.push(...permissionExists.permissions)
    //         } else if (permissionExists.type === 'building') {
    //             permissionArray[1]?.permissions.push(...permissionExists.permissions)
    //         }

    //         // permissionArray.push(...permissionExists.permissions)
    //     }))
    // }

    if (accessBody.resource) {
        employee.permissions?.map(permission => {
            if (permission.type === 'company') {
                permissionArray[0]?.permissions.push(permission)
            } else if (permission.type === 'building') {
                permissionArray[1]?.permissions.push(permission)
            } else if(permission.type ==='product'){
                permissionArray[2]?.permissions.push(permission)
            }
        })
    }

    // console.log(permissionArray)

    const employeeCompanyOwnsBuilding = await checkIfEmployeesCompanyOwnsBuilding(employee, accessBody);
    const employeeBelongsToBuilding = employee.company.buildingId.toString() === accessBody.buildingId.toString()
    const employeeBelongsToCompany = employee.company.companyId.toString() === accessBody.companyId.toString()
    const productAdmin = permissionArray[2]?.permissions.find((item) => item.resource === "product" && item.action === "admin") ? true : false

    let accessType = 'company'

    // Check if the employee belongs to the building or if their company owns the building
    if (!employeeBelongsToBuilding && !employeeCompanyOwnsBuilding && !productAdmin) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Employee does not have access to this building');
    }

    // Check if the employee belongs to the company
    if (!employeeBelongsToCompany && !employeeCompanyOwnsBuilding && !productAdmin) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Employee does not belong to this company');
    }

    let hasRequiredPermission = false

    // employee access his company within the right building
    if (employeeBelongsToBuilding && employeeBelongsToCompany) {
        if (accessBody.resource && accessBody.resource.length > 0) {
            hasRequiredPermission = accessBody.resource.every((reqPermission: string) =>
                permissionArray[0]?.permissions.some((permission: { resource: string; action: string }) =>
                    permission.resource === reqPermission && (permission.action === 'access' || permission.action === 'admin')
                )
            );

            if (!hasRequiredPermission) {
                throw new ApiError(httpStatus.FORBIDDEN, 'Employee does not have the required permissions for this resource');
            }

            console.log('Company permissions:', permissionArray[0])
            accessType = 'company'
        } else {
            // hasRequiredPermission = true;
            throw new ApiError(httpStatus.BAD_REQUEST, 'Permissions do not match or are missing');
        }
    }
    // building owner access accesses any company while having appropriate permissions
    else if (employeeCompanyOwnsBuilding) {
        // Check if the employee has access to the resource
        if (accessBody.resource && accessBody.resource.length > 0) {

            hasRequiredPermission = accessBody.resource.every((reqPermission: string) =>
                permissionArray[1]?.permissions.some((permission: { resource: string; action: string }) =>
                    permission.resource === reqPermission && (permission.action === 'access' || permission.action === 'admin')
                )
            );

            if (!hasRequiredPermission) {
                throw new ApiError(httpStatus.FORBIDDEN, 'Employee does not have the required permissions for this resource');
            }

            console.log('building permissions:', permissionArray[1])
            accessType = 'building'
        } else {
            // hasRequiredPermission = true;
            throw new ApiError(httpStatus.BAD_REQUEST, 'Permissions do not match or are missing');
        }
    } else if (productAdmin) {
        accessType = 'product'
        hasRequiredPermission = true
    }
    // else {
    //     // Check if the employee has access to the resource
    //     if (accessBody.requiredPermission) {
    //         const employeePermissions = permissionArray.filter((permission: { resource: string; action: string }) => {
    //             return permission.resource === accessBody.accessType && permission.action === 'allow'
    //         })

    //         if (employeePermissions.length === 0) {
    //             throw new ApiError(httpStatus.FORBIDDEN, 'Employee does not have access to this resource');
    //         }
    //     }
    // }

    const accessLog = hasRequiredPermission ? await createAccessLog({
        accessCardId: accessCard._id,
        buildingId: accessBody.buildingId,
        companyId: accessBody.companyId,
        accessType: accessType,
        eventType: accessBody.eventType,
        resource: accessBody.resource,
        timestamp: new Date(),
    }) : null;

    if (!accessLog) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create access log');
    }

    // console.log('accessLog:', accessLog)

    return permissionArray.length > 0 ? `Access to ${accessBody.resource} granted` : accessLog;
};

// Function to check if the employee's company owns the building
async function checkIfEmployeesCompanyOwnsBuilding(employee: IEmployeeDoc, accessBody: IAccess): Promise<boolean> {
    const employeeCompanyOwnsBuilding = await Company.findOne({
        _id: employee.company.companyId,
        "ownedBuildings.buildingId": accessBody.buildingId
    });
    return !!employeeCompanyOwnsBuilding;
}