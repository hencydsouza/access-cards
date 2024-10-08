import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import pick from '../utils/pick';
import { IOptions } from '../paginate/paginate';
import * as buildingService from './building.service'
import { IBuildingDetails, IBuildingDoc } from './building.interfaces';

export const createBuilding = catchAsync(async (req: Request, res: Response<IBuildingDoc>) => {
    if (req.scope == 'company' || req.scope == 'building') {
        throw new ApiError(httpStatus.FORBIDDEN, 'Cannot create building')
    }
    const building = await buildingService.createBuilding(req.body);
    res.status(httpStatus.CREATED).json(building);
});

export const getBuildings = catchAsync(async (req: Request, res: Response) => {
    if (req.scope == 'company' || req.scope == 'building') {
        throw new ApiError(httpStatus.FORBIDDEN, 'Cannot get buildings')
    }
    const filter = pick(req.query, ['name', 'address']);
    const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
    const result = await buildingService.queryBuildings(filter, options);
    res.json(result);
});

export const getAllBuildings = catchAsync(async (req: Request, res: Response) => {
    console.log(req.body)
    const result = await buildingService.getAllBuildings()
    res.json(result)
})

export const getBuilding = catchAsync(async (req: Request, res: Response<IBuildingDoc>) => {
    if (typeof req.params['buildingId'] === 'string') {
        if (req.scope == 'company' || req.scope == 'building') {
            throw new ApiError(httpStatus.FORBIDDEN, 'Cannot get building')
        }
        const building = await buildingService.getBuildingById(new mongoose.Types.ObjectId(req.params['buildingId']));
        if (!building) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Building not found');
        }
        res.json(building);
    }
});

export const getBuildingDetails = catchAsync(async (req: Request, res: Response<IBuildingDetails[]>) => {
    if (typeof req.params['buildingId'] === 'string') {
        if (req.scope == 'company') {
            throw new ApiError(httpStatus.FORBIDDEN, 'Cannot get building')
        }
        const building = await buildingService.getBuildingDetails(new mongoose.Types.ObjectId(req.params['buildingId']));
        if (!building) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Building not found');
        }
        res.json(building);
    }
});

export const getBuildingNames = catchAsync(async (req: Request, res: Response) => {
    console.log(req.body)
    const result = await buildingService.getAllBuildingNames()
    res.json(result)
})

export const updateBuilding = catchAsync(async (req: Request, res: Response<IBuildingDoc | null>) => {
    if (typeof req.params['buildingId'] === 'string') {
        if (req.scope == 'company' || req.scope == 'building') {
            throw new ApiError(httpStatus.FORBIDDEN, 'Cannot update building')
        }
        const building = await buildingService.updateBuildingById(new mongoose.Types.ObjectId(req.params['buildingId']), req.body);
        res.send(building);
    }
});

export const deleteBuilding = catchAsync(async (req: Request, res: Response<null>) => {
    if (typeof req.params['buildingId'] === 'string') {
        if (req.scope == 'company' || req.scope == 'building') {
            throw new ApiError(httpStatus.FORBIDDEN, 'Cannot delete building')
        }
        await buildingService.deleteBuildingById(new mongoose.Types.ObjectId(req.params['buildingId']));
        res.status(httpStatus.NO_CONTENT).send();
    }
});
