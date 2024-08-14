import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import pick from '../utils/pick';
import { IOptions } from '../paginate/paginate';
import * as configService from './config.service'
import { IConfigDoc } from './config.interfaces';

export const createConfig = catchAsync(async (req: Request, res: Response<IConfigDoc>) => {
    if (req.scope == 'company' || req.scope == 'building') {
        throw new ApiError(httpStatus.FORBIDDEN, 'Cannot create config')
    }
    const config = await configService.createConfig(req.body);
    res.status(httpStatus.CREATED).send(config);
});

export const getConfigs = catchAsync(async (req: Request, res: Response) => {
    if (req.scope == 'company' || req.scope == 'building') {
        throw new ApiError(httpStatus.FORBIDDEN, 'Cannot get configs')
    }
    const filter = pick(req.query, ['key']);
    const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
    const result = await configService.queryConfigs(filter, options);
    res.send(result);
});

export const getConfigById = catchAsync(async (req: Request, res: Response<IConfigDoc>) => {
    if (typeof req.params['configId'] === 'string') {
        if (req.scope == 'company' || req.scope == 'building') {
            throw new ApiError(httpStatus.FORBIDDEN, 'Cannot get config')
        }
        const config = await configService.getConfigById(new mongoose.Types.ObjectId(req.params['configId']));
        if (!config) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Config not found');
        }
        res.send(config);
    }
});

export const updateConfig = catchAsync(async (req: Request, res: Response<IConfigDoc | null>) => {
    if (typeof req.params['configId'] === 'string') {
        if (req.scope == 'company' || req.scope == 'building') {
            throw new ApiError(httpStatus.FORBIDDEN, 'Cannot update config')
        }
        const config = await configService.updateConfigById(new mongoose.Types.ObjectId(req.params['configId']), req.body);
        res.send(config);
    }
});

export const deleteConfig = catchAsync(async (req: Request, res: Response<null>) => {
    if (typeof req.params['configId'] === 'string') {
        if (req.scope == 'company' || req.scope == 'building') {
            throw new ApiError(httpStatus.FORBIDDEN, 'Cannot delete config')
        }
        await configService.deleteConfigById(new mongoose.Types.ObjectId(req.params['configId']));
        res.status(httpStatus.NO_CONTENT).send();
    }
});
