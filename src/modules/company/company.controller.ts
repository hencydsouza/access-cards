import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import pick from '../utils/pick';
import { IOptions } from '../paginate/paginate';
import * as companyService from './company.service'

export const createCompany = catchAsync(async (req: Request, res: Response) => {
    const company = await companyService.createCompany(req.body);
    res.status(httpStatus.CREATED).send(company);
});

export const getCompanies = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, ['name', 'buildingName']);
    const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
    const result = await companyService.queryCompanies(filter, options);
    res.send(result);
});

export const getCompany = catchAsync(async (req: Request, res: Response) => {
    if (typeof req.params['companyId'] === 'string') {
        const company = await companyService.getCompanyById(new mongoose.Types.ObjectId(req.params['companyId']));
        if (!company) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
        }
        res.send(company);
    }
});

export const updateCompany = catchAsync(async (req: Request, res: Response) => {
    if (typeof req.params['companyId'] === 'string') {
        const company = await companyService.updateCompanyById(new mongoose.Types.ObjectId(req.params['companyId']), req.body);
        res.send(company);
    }
});

export const deleteCompany = catchAsync(async (req: Request, res: Response) => {
    if (typeof req.params['companyId'] === 'string') {
        await companyService.deleteCompanyById(new mongoose.Types.ObjectId(req.params['companyId']));
        res.status(httpStatus.OK).send({ message: "Company and it's reference from employees removed" });
    }
});
