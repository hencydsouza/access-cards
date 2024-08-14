import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose, { Document } from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import pick from '../utils/pick';
import { IOptions, QueryResult } from '../paginate/paginate';
import * as accessCardService from './accessCard.service'
import { IAccessCardDoc } from './accessCard.interfaces';

export const createAccessCard = catchAsync(async (req: Request, res: Response<IAccessCardDoc>) => {
    const accessCard = await accessCardService.createAccessCard(req.body, req.scope, req.employee);
    res.status(httpStatus.CREATED).send(accessCard);
});

// "page": 1,
// "limit": 10,
// "totalPages": 1,
// "totalResults": 5

export const getAccessCards = catchAsync(async (req: Request, res: Response) => {
    let result: QueryResult<Document<IAccessCardDoc>>;
    const filter = pick(req.query, ['name', 'address']);
    let options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);

    if (req.scope === 'company') {
        filter["cardHolder.companyId"] = req.employee.company.companyId.toString();
    } else if (req.scope === 'building') {
        filter["cardHolder.buildingId"] = req.employee.company.buildingId.toString();
    }

    result = await accessCardService.queryAccessCards(filter, options);

    res.send(result);
});

export const getAccessCard = catchAsync(async (req: Request, res: Response<IAccessCardDoc>) => {
    if (typeof req.params['accessCardId'] === 'string') {
        const accessCard = await accessCardService.getAccessCardById(new mongoose.Types.ObjectId(req.params['accessCardId']));
        if (!accessCard) {
            throw new ApiError(httpStatus.NOT_FOUND, 'AccessCard not found');
        }
        if (req.scope === 'company' && accessCard?.cardHolder.companyId.toString() !== req.employee.company.companyId.toString()) {
            throw new ApiError(httpStatus.FORBIDDEN, 'AccessCard not found');
        }
        if (req.scope === 'building' && accessCard?.cardHolder.buildingId.toString() !== req.employee.company.buildingId.toString()) {
            throw new ApiError(httpStatus.FORBIDDEN, 'AccessCard not found');
        }
        res.send(accessCard);
    }
});

export const updateAccessCard = catchAsync(async (req: Request, res: Response<IAccessCardDoc | null>) => {
    if (typeof req.params['accessCardId'] === 'string') {
        const accessCard = await accessCardService.updateAccessCardById(new mongoose.Types.ObjectId(req.params['accessCardId']), req.body, req.scope, req.employee);
        res.send(accessCard);
    }
});

export const deleteAccessCard = catchAsync(async (req: Request, res: Response<null>) => {
    if (typeof req.params['accessCardId'] === 'string') {
        await accessCardService.deleteAccessCardById(new mongoose.Types.ObjectId(req.params['accessCardId']), req.scope, req.employee);
        res.status(httpStatus.NO_CONTENT).send();
    }
});
