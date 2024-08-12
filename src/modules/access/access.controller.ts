import httpStatus from 'http-status';
import { Request, Response } from 'express';
// import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
// import ApiError from '../errors/ApiError';
// import pick from '../utils/pick';
// import { IOptions } from '../paginate/paginate';
import * as accessService from './access.service'
import { AccessResponse } from './access.interfaces';

export const access = catchAsync(async (req: Request, res: Response<AccessResponse>) => {
    const result = await accessService.accessService(req.body);
    res.status(httpStatus.CREATED).json({ message: result }).send();
});