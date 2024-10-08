import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import pick from '../utils/pick';
import { IOptions } from '../paginate/paginate';
import * as accessLogService from './accessLog.service'
import { Config } from '../config';
import reConfigureAccessLogs from '../utils/reConfigureAccessLogs';
import { IAccessLogDoc } from './accessLog.interfaces';

export const createAccessLog = catchAsync(async (req: Request, res: Response<IAccessLogDoc | null>) => {
    const accessLog = await accessLogService.createAccessLog(req.body);
    res.status(httpStatus.CREATED).send(accessLog);
});

export const getAccessLogs = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, ['name', 'address']);
    const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
    const result = await accessLogService.queryAccessLogs(filter, options);
    res.send(result);
});

export const getAccessLog = catchAsync(async (req: Request, res: Response<IAccessLogDoc>) => {
    if (typeof req.params['accessLogId'] === 'string') {
        const accessLog = await accessLogService.getAccessLogById(new mongoose.Types.ObjectId(req.params['accessLogId']));
        if (!accessLog) {
            throw new ApiError(httpStatus.NOT_FOUND, 'AccessLog not found');
        }
        res.send(accessLog);
    }
});

export const getAllAccessLogs = catchAsync(async (req: Request, res: Response) => {
    const { page, limit } = req.query
    const result = await accessLogService.getAllAccessLogs(page ? Number(page) : 1, limit ? Number(limit) : 100);
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'AccessLogs not found');
    }
    res.send(result);
});

export const deleteAccessLog = catchAsync(async (req: Request, res: Response<null>) => {
    if (typeof req.params['accessLogId'] === 'string') {
        await accessLogService.deleteAccessLogById(new mongoose.Types.ObjectId(req.params['accessLogId']));
        res.status(httpStatus.NO_CONTENT).send();
    }
});

export const reConfigureAccessLogsController = catchAsync(async (req: Request, res: Response<{ message: string }>) => {
    console.log(req.body)
    const config = await Config.findOne({ key: "accessLogInterval" })
    await reConfigureAccessLogs(Number(config?.value) || 21600);
    res.status(httpStatus.OK).json({
        message: 'Access Logs Reconfigured to ' + (Number(config?.value) / 3600) + ' hours'
    }).send();
});

export const reConfigureAccessLogsByValue = catchAsync(async (req: Request, res: Response<{ message: string }>) => {
    if (typeof req.params["accessLogInterval"] === 'string') {
        await Config.updateOne({ key: "accessLogInterval" }, { value: Number.parseInt(req.params["accessLogInterval"] || '21600') })
        await reConfigureAccessLogs(Number(req.params["accessLogInterval"]));
        res.status(httpStatus.OK).json({
            message: 'Access Logs Reconfigured to ' + (Number.parseInt(req.params["accessLogInterval"] || '21600') / 3600) + ' hours'
        }).send();
    }
});