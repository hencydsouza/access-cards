import httpStatus from "http-status";
import mongoose, { Document } from "mongoose";
import Employee from "./employee.model";
import { ApiError } from "../errors";
import { IOptions, QueryResult } from '../paginate/paginate';
import { IEmployeeDoc, NewCreatedEmployee, UpdateEmployeeBody } from "./employee.interfaces";
import { Building } from "../building";
import { Company } from "../company";
import { AccessLevel } from "../accessLevel";
// import { Building } from "../building";

export const createEmployee = async (employeeBody: NewCreatedEmployee): Promise<IEmployeeDoc> => {
    if (await Employee.isEmailTaken(employeeBody.email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }

    const targetCompany = await Company.findOne({ name: employeeBody.companyName })
    if (!targetCompany)
        throw new ApiError(httpStatus.NOT_FOUND, 'Company does not exist')

    const targetBuilding = await Building.findOne({ name: employeeBody.buildingName })
    if (!targetBuilding) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Building not found')
    }

    employeeBody.company = {
        companyId: targetCompany._id,
        buildingId: targetBuilding._id
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
            const accessLevelExists = await AccessLevel.findOne({ name: accessObject.accessLevel });
            if (!accessLevelExists) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Access level does not exist');
            }
        }));
    }

    const employee = await Employee.create(employeeBody);
    return employee;
};

export const queryEmployees = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult<Document<IEmployeeDoc>>> => {
    const employees = await Employee.paginate(filter, options);
    return employees;
};

export const getEmployeeById = async (employeeId: mongoose.Types.ObjectId): Promise<IEmployeeDoc | null> => Employee.findById(employeeId);

export const getEmployeeByEmail = async (email: string): Promise<IEmployeeDoc | null> => Employee.findOne({ email });


export const updateEmployeeById = async (
    employeeId: mongoose.Types.ObjectId,
    updateBody: UpdateEmployeeBody
): Promise<IEmployeeDoc | null> => {
    const employee = await getEmployeeById(employeeId);
    if (!employee) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Employee not found');
    }

    if (updateBody.companyName) {
        const targetCompany = await Company.findOne({ name: updateBody.companyName })
        if (!targetCompany) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Company does not exist')
        }
        employee.company.companyId = targetCompany._id
    }

    if (updateBody.buildingName) {
        const targetBuilding = await Building.findOne({ name: updateBody.buildingName })
        if (!targetBuilding) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Building not found')
        }
        employee.company.buildingId = targetBuilding._id
    }

    if (updateBody.email && (await Employee.isEmailTaken(updateBody.email, employeeId))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }

    // TODO: implement access card, access level logic if changed

    if (updateBody.accessLevels) {
        updateBody.accessLevels.forEach(async (accessObject) => {
            const accessLevelExists = await AccessLevel.findOne({ name: accessObject.accessLevel });
            if (!accessLevelExists) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Access level does not exist');
            }
        });
    }

    Object.assign(employee, updateBody);
    await employee.save();
    return employee;
};

export const deleteEmployeeById = async (employeeId: mongoose.Types.ObjectId): Promise<IEmployeeDoc | null> => {
    const employee = await getEmployeeById(employeeId);
    if (!employee) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Employee not found');
    }

    // TODO: implement access card and access level logic

    await employee.deleteOne();
    return employee;
};
