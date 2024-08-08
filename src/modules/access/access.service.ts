import httpStatus from "http-status";
import { ApiError } from "../errors";
import { AccessCard } from "../accessCard";
import { IAccess } from "./access.interfaces";
import { Employee } from "../employee";
import { createAccessLog } from "../accessLog/accessLog.service";
import { Company } from "../company";
import { IEmployeeDoc } from "../employee/employee.interfaces";

export const accessService = async (accessBody: IAccess): Promise<any> => {
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

    const employeeCompanyOwnsBuilding = await checkIfEmployeesCompanyOwnsBuilding(employee, accessBody);

    // Check if the employee belongs to the building or if their company owns the building
    if (employee.company.buildingId.toString() !== accessBody.buildingId.toString() && !employeeCompanyOwnsBuilding) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Employee does not have access to this building');
    }

    // Check if the employee belongs to the company
    if (employee.company.companyId.toString() !== accessBody.companyId.toString() && !employeeCompanyOwnsBuilding) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Employee does not belong to this company');
    }

    // TODO: verify permissions based on building ownership

    const accessLog = await createAccessLog({
        accessCardId: accessCard._id,
        buildingId: accessBody.buildingId,
        companyId: accessBody.companyId,
        accessType: accessBody.accessType,
        timestamp: new Date(),
    });

    if (!accessLog) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create access log');
    }

    return accessLog;
};

// Function to check if the employee's company owns the building
async function checkIfEmployeesCompanyOwnsBuilding(employee: IEmployeeDoc, accessBody: IAccess): Promise<boolean> {
    const employeeCompanyOwnsBuilding = await Company.findOne({
        _id: employee.company.companyId,
        "ownedBuildings.buildingId": accessBody.buildingId
    });
    return !!employeeCompanyOwnsBuilding;
}