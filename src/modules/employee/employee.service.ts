import httpStatus from "http-status";
import mongoose, { Document } from "mongoose";
import Employee from "./employee.model";
import { ApiError } from "../errors";
import { IOptions, QueryResult } from '../paginate/paginate';
import { IEmployeeDoc, NewCreatedEmployee, UpdateEmployeeBody } from "./employee.interfaces";
import { Building } from "../building";
import { Company } from "../company";
import { AccessLevel } from "../accessLevel";
import { AccessCard } from "../accessCard";
// import { Building } from "../building";

export const createEmployee = async (employeeBody: NewCreatedEmployee, scope: string, client: IEmployeeDoc): Promise<IEmployeeDoc> => {
    if (await Employee.isEmailTaken(employeeBody.email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }

    const targetCompany = await Company.findById(employeeBody.companyId)
    if (!targetCompany)
        throw new ApiError(httpStatus.NOT_FOUND, 'Company does not exist')

    const targetBuilding = await Building.findById(employeeBody.buildingId)
    if (!targetBuilding) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Building not found')
    }

    employeeBody.company = {
        companyId: targetCompany._id,
        buildingId: targetBuilding._id
    }

    if (scope === 'company' && client.company.companyId.toString() !== targetCompany._id.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Cannot create employee for another company');
    }
    if (scope === 'building' && client.company.buildingId.toString() !== targetBuilding._id.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Cannot create employee for another building');
    }

    // let duplicateEmployee = await Employee.findOne({ name: employeeBody.name, 'company.companyId': employeeBody.company.companyId });
    // if (duplicateEmployee) {
    //     throw new ApiError(httpStatus.BAD_REQUEST, 'Employee with this name already exists in the company');
    // }

    if (!employeeBody.password) {
        employeeBody.password = 'pass1234';
    }

    // TODO: implement access card and access level logic

    if (employeeBody.accessLevels) {
        await Promise.all(employeeBody.accessLevels.map(async (accessObject) => {
            const accessLevelExists = await AccessLevel.findById(accessObject.accessLevel);
            if (!accessLevelExists) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Access level does not exist');
            }
        }));
    }

    const employee = await Employee.create(employeeBody);
    refreshPermissions(employee._id)
    return employee;
};

export const queryEmployees = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult<Document<IEmployeeDoc>>> => {
    const employees = await Employee.paginate(filter, options);
    return employees;
};

export const getEmployeeNames = async () => {
    const result = await Employee.find().select({ name: 1, _id: 1 })
    return result
}

export const getEmployeeById = async (employeeId: mongoose.Types.ObjectId): Promise<IEmployeeDoc | null> => Employee.findById(employeeId, { "accessLevels._id": 0 });

export const getEmployeeByEmail = async (email: string): Promise<IEmployeeDoc | null> => Employee.findOne({ email });


export const updateEmployeeById = async (
    employeeId: mongoose.Types.ObjectId,
    updateBody: UpdateEmployeeBody,
    scope: string | null,
    client: IEmployeeDoc | null,
): Promise<IEmployeeDoc | null> => {
    const employee = await getEmployeeById(employeeId);
    if (!employee) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Employee not found');
    }

    if (scope === 'company' && client?.company.companyId.toString() !== employee.company.companyId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Cannot update employee from another company');
    }
    if (scope === 'building' && client?.company.buildingId.toString() !== employee.company.buildingId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Cannot update employee from another building');
    }

    if (updateBody.companyId) {
        const targetCompany = await Company.findById(updateBody.companyId)
        if (!targetCompany) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Company does not exist')
        }
        employee.company.companyId = targetCompany._id
    }

    if (updateBody.buildingId) {
        const targetBuilding = await Building.findById(updateBody.buildingId)
        if (!targetBuilding) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Building not found')
        }
        employee.company.buildingId = targetBuilding._id
    }

    if (updateBody.email && (await Employee.isEmailTaken(updateBody.email, employeeId))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }

    // update access card
    const accessCard = await AccessCard.findOne({ "cardHolder.employeeId": employee._id })
    if (accessCard) {
        if (updateBody.companyId)
            accessCard.cardHolder.companyId = new mongoose.Types.ObjectId(updateBody.companyId)
        if (updateBody.buildingId)
            accessCard.cardHolder.buildingId = new mongoose.Types.ObjectId(updateBody.buildingId)
        await accessCard.save()
    }

    if (updateBody.accessLevels) {
        updateBody.accessLevels.forEach(async (accessObject) => {
            const accessLevelExists = await AccessLevel.findById(accessObject.accessLevel);
            if (!accessLevelExists) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Access level does not exist');
            }
        });
    }

    Object.assign(employee, updateBody);
    await employee.save();
    refreshPermissions(employee._id)
    return employee;
};

export const deleteEmployeeById = async (employeeId: mongoose.Types.ObjectId, scope: string, client: IEmployeeDoc): Promise<IEmployeeDoc | null> => {
    const employee = await getEmployeeById(employeeId);
    if (!employee) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Employee not found');
    }

    if (scope === 'company' && client.company.companyId.toString() !== employee.company.companyId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Cannot delete employee from another company');
    }
    if (scope === 'building' && client.company.buildingId.toString() !== employee.company.buildingId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Cannot delete employee from another building');
    }

    // TODO: implement access card and access level logic

    await employee.deleteOne();
    return employee;
};

export const refreshPermissions = async (employeeId: mongoose.Types.ObjectId): Promise<IEmployeeDoc | null> => {
    const employee = await getEmployeeById(employeeId);
    if (!employee) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Employee not found');
    }

    const permissions = await Employee.aggregate([
        {
            '$match': {
                '_id': new mongoose.Types.ObjectId(employee._id)
            }
        }, {
            '$lookup': {
                'from': 'accesslevels',
                'localField': 'accessLevels.accessLevel',
                'foreignField': '_id',
                'pipeline': [
                    {
                        '$project': {
                            'permissions': 1,
                            'type': 1
                        }
                    }, {
                        '$unwind': '$permissions'
                    }, {
                        '$project': {
                            '_id': '$permissions._id',
                            'resource': '$permissions.resource',
                            'action': '$permissions.action',
                            'type': '$type'
                        }
                    }
                ],
                'as': 'permissions'
            }
        }, {
            '$project': {
                '_id': 0,
                'permissions': 1
            }
        }
    ])

    if (permissions) {
        employee.permissions = permissions[0].permissions
    }

    await employee.save()

    return employee
}