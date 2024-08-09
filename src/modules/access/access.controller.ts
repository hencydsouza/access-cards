import httpStatus from 'http-status';
import { Request, Response } from 'express';
// import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
// import ApiError from '../errors/ApiError';
// import pick from '../utils/pick';
// import { IOptions } from '../paginate/paginate';
import * as accessService from './access.service'

export const access = catchAsync(async (req: Request, res: Response) => {
    const result = await accessService.accessService(req.body);
    res.status(httpStatus.CREATED).json({ message: result }).send();
});