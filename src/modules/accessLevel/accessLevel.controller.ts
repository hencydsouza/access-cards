import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import pick from '../utils/pick';
import { IOptions } from '../paginate/paginate';
import * as accessLevelService from './accessLevel.service'
import { IAccessLevelDoc } from './accessLevel.interfaces';

export const createAccessLevel = catchAsync(async (req: Request, res: Response<IAccessLevelDoc>) => {
    const accessLevel = await accessLevelService.createAccessLevel(req.body);
    res.status(httpStatus.CREATED).send(accessLevel);
});

export const getAccessLevels = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, ['name']);
    const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
    const result = await accessLevelService.queryAccessLevels(filter, options);
    res.send(result);
});

export const getAccessLevel = catchAsync(async (req: Request, res: Response<IAccessLevelDoc>) => {
    if (typeof req.params['accessLevelId'] === 'string') {
        const accessLevel = await accessLevelService.getAccessLevelById(new mongoose.Types.ObjectId(req.params['accessLevelId']));
        if (!accessLevel) {
            throw new ApiError(httpStatus.NOT_FOUND, 'AccessLevel not found');
        }
        res.send(accessLevel);
    }
});

export const getAccessLevelNames = catchAsync(async (req: Request, res: Response) => {
    console.log(req.body)
    const result = await accessLevelService.getAllAccessLevelNames()
    res.json(result)
})

export const updateAccessLevel = catchAsync(async (req: Request, res: Response<IAccessLevelDoc | null>) => {
    if (typeof req.params['accessLevelId'] === 'string') {
        const accessLevel = await accessLevelService.updateAccessLevelById(new mongoose.Types.ObjectId(req.params['accessLevelId']), req.body);
        res.send(accessLevel);
    }
});

export const addPermissionToAccessLevel = catchAsync(async (req: Request, res: Response<IAccessLevelDoc | null>) => {
    if (typeof req.params['accessLevelId'] === 'string') {
        const accessLevel = await accessLevelService.addPermissionToAccessLevel(new mongoose.Types.ObjectId(req.params['accessLevelId']), req.body);
        res.send(accessLevel);
    }
})

export const removePermissionFromAccessLevel = catchAsync(async (req: Request, res: Response<IAccessLevelDoc | null>) => {
    if (typeof req.params['accessLevelId'] === 'string') {
        const accessLevel = await accessLevelService.removePermissionFromAccessLevel(new mongoose.Types.ObjectId(req.params['accessLevelId']), req.body);
        res.send(accessLevel);
    }
})
export const deleteAccessLevel = catchAsync(async (req: Request, res: Response<null>) => {
    if (typeof req.params['accessLevelId'] === 'string') {
        await accessLevelService.deleteAccessLevelById(new mongoose.Types.ObjectId(req.params['accessLevelId']));
        res.status(httpStatus.NO_CONTENT).send();
    }
});
