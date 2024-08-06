import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import pick from '../utils/pick';
import { IOptions } from '../paginate/paginate';
import * as accessLogService from './accessLog.service'

export const createAccessLog = catchAsync(async (req: Request, res: Response) => {
    const accessLog = await accessLogService.createAccessLog(req.body);
    res.status(httpStatus.CREATED).send(accessLog);
});

export const getAccessLogs = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, ['name', 'address']);
    const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
    const result = await accessLogService.queryAccessLogs(filter, options);
    res.send(result);
});

export const getAccessLog = catchAsync(async (req: Request, res: Response) => {
    if (typeof req.params['accessLogId'] === 'string') {
        const accessLog = await accessLogService.getAccessLogById(new mongoose.Types.ObjectId(req.params['accessLogId']));
        if (!accessLog) {
            throw new ApiError(httpStatus.NOT_FOUND, 'AccessLog not found');
        }
        res.send(accessLog);
    }
});

// export const updateAccessLog = catchAsync(async (req: Request, res: Response) => {
//     if (typeof req.params['accessLogId'] === 'string') {
//         const accessLog = await accessLogService.updateAccessLogById(new mongoose.Types.ObjectId(req.params['accessLogId']), req.body);
//         res.send(accessLog);
//     }
// });

export const deleteAccessLog = catchAsync(async (req: Request, res: Response) => {
    if (typeof req.params['accessLogId'] === 'string') {
        await accessLogService.deleteAccessLogById(new mongoose.Types.ObjectId(req.params['accessLogId']));
        res.status(httpStatus.NO_CONTENT).send();
    }
});
