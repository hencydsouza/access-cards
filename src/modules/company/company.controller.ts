import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import pick from '../utils/pick';
import { IOptions } from '../paginate/paginate';
import * as companyService from './company.service'
import { ICompanyDoc } from './company.interfaces';

export const createCompany = catchAsync(async (req: Request, res: Response<ICompanyDoc>) => {
    if (req.scope === 'company' || req.scope === 'building') {
        throw new ApiError(httpStatus.FORBIDDEN, 'Cannot create company');
    }

    const company = await companyService.createCompany(req.body);
    res.status(httpStatus.CREATED).send(company);
});

export const getCompanies = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, ['name']);
    const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);

    if (req.scope === 'company') {
        filter["_id"] = req.employee.company.companyId.toString();
    } else if (req.scope === 'building') {
        filter["buildings.buildingId"] = req.employee.company.buildingId.toString();
    }

    const result = await companyService.queryCompanies(filter, options);
    res.send(result);
});

export const getCompany = catchAsync(async (req: Request, res: Response<ICompanyDoc>) => {
    if (typeof req.params['companyId'] === 'string') {
        const company = await companyService.getCompanyById(new mongoose.Types.ObjectId(req.params['companyId']));
        if (!company) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
        }
        if (req.scope === 'company' && company._id.toString() !== req.employee.company.companyId.toString()) {
            throw new ApiError(httpStatus.FORBIDDEN, 'Company not found');
        }
        if (req.scope === 'building' && company.buildings.buildingId.toString() !== req.employee.company.buildingId.toString()) {
            throw new ApiError(httpStatus.FORBIDDEN, 'AccessCard not found');
        }
        res.send(company);
    }
});

export const updateCompany = catchAsync(async (req: Request, res: Response<ICompanyDoc | null>) => {
    if (typeof req.params['companyId'] === 'string') {
        const company = await companyService.updateCompanyById(new mongoose.Types.ObjectId(req.params['companyId']), req.body, req.scope, req.employee);
        res.send(company);
    }
});

export const deleteCompany = catchAsync(async (req: Request, res: Response<{ message: string }>) => {
    if (typeof req.params['companyId'] === 'string') {
        if (req.scope === 'company' || req.scope === 'building') {
            throw new ApiError(httpStatus.FORBIDDEN, 'Cannot delete company');
        }
        await companyService.deleteCompanyById(new mongoose.Types.ObjectId(req.params['companyId']), req.scope, req.employee);
        res.status(httpStatus.OK).send({ message: "Company and it's reference from employees removed" });
    }
});
