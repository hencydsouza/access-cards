import httpStatus from "http-status";
import mongoose from "mongoose";
import Employee from "./employee.model";
import { ApiError } from "../errors";
import { IOptions, QueryResult } from '../paginate/paginate';
import { IEmployeeDoc, NewCreatedEmployee, UpdateEmployeeBody } from "./employee.interfaces";
import { Building } from "../building";
import { Company } from "../company";
// import { Building } from "../building";

export const createEmployee = async (employeeBody: NewCreatedEmployee): Promise<IEmployeeDoc> => {
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

    // TODO: implement access card and access level logic

    return Employee.create(employeeBody);
};

export const queryEmployees = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
    const employees = await Employee.paginate(filter, options);
    return employees;
};

export const getEmployeeById = async (employeeId: mongoose.Types.ObjectId): Promise<IEmployeeDoc | null> => Employee.findById(employeeId);

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

    // TODO: implement access card, access level logic if changed

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
