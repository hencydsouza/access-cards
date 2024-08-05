import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import pick from '../utils/pick';
import { IOptions } from '../paginate/paginate';
import * as buildingService from './building.service'

export const createBuilding = catchAsync(async (req: Request, res: Response) => {
    const building = await buildingService.createBuilding(req.body);
    res.status(httpStatus.CREATED).send(building);
});

export const getBuildings = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, ['name', 'address']);
    const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
    const result = await buildingService.queryBuildings(filter, options);
    res.send(result);
});

export const getBuilding = catchAsync(async (req: Request, res: Response) => {
    if (typeof req.params['buildingId'] === 'string') {
        const building = await buildingService.getBuildingById(new mongoose.Types.ObjectId(req.params['buildingId']));
        if (!building) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Building not found');
        }
        res.send(building);
    }
});

export const updateBuilding = catchAsync(async (req: Request, res: Response) => {
    if (typeof req.params['buildingId'] === 'string') {
        const building = await buildingService.updateBuildingById(new mongoose.Types.ObjectId(req.params['buildingId']), req.body);
        res.send(building);
    }
});

export const deleteBuilding = catchAsync(async (req: Request, res: Response) => {
    if (typeof req.params['buildingId'] === 'string') {
        await buildingService.deleteBuildingById(new mongoose.Types.ObjectId(req.params['buildingId']));
        res.status(httpStatus.NO_CONTENT).send();
    }
});
