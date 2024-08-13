import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import pick from '../utils/pick';
import { IOptions } from '../paginate/paginate';
import * as employeeService from './employee.service'
import { IEmployeeDoc } from './employee.interfaces';

export const createEmployee = catchAsync(async (req: Request, res: Response<IEmployeeDoc>) => {
    const employee = await employeeService.createEmployee(req.body);
    res.status(httpStatus.CREATED).send(employee);
});

export const getEmployees = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, ['name']);
    const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
    const result = await employeeService.queryEmployees(filter, options);
    res.send(result);
});

export const getEmployee = catchAsync(async (req: Request, res: Response<IEmployeeDoc>) => {
    if (typeof req.params['employeeId'] === 'string') {
        const employee = await employeeService.getEmployeeById(new mongoose.Types.ObjectId(req.params['employeeId']));
        if (!employee) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Employee not found');
        }
        res.send(employee);
    }
});

export const updateEmployee = catchAsync(async (req: Request, res: Response<IEmployeeDoc | null>) => {
    if (typeof req.params['employeeId'] === 'string') {
        const employee = await employeeService.updateEmployeeById(new mongoose.Types.ObjectId(req.params['employeeId']), req.body);
        res.send(employee);
    }
});

export const deleteEmployee = catchAsync(async (req: Request, res: Response<null>) => {
    if (typeof req.params['employeeId'] === 'string') {
        await employeeService.deleteEmployeeById(new mongoose.Types.ObjectId(req.params['employeeId']));
        res.status(httpStatus.NO_CONTENT).send();
    }
});

export const refreshEmployeePermissions = catchAsync(async (req: Request, res: Response) => {
    if (typeof req.params['employeeId'] === 'string') {
        await employeeService.refreshPermissions(new mongoose.Types.ObjectId(req.params['employeeId']));
        res.status(httpStatus.NO_CONTENT).send();
    }
})