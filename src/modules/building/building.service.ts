import httpStatus from "http-status";
import mongoose from "mongoose";
import Building from "./building.model";
import { ApiError } from "../errors";
import { IOptions, QueryResult } from '../paginate/paginate';
import { IBuildingDoc, NewCreatedBuilding, UpdateBuildingBody } from "./building.interfaces";

/**
 * Create a building
 * @param {NewCreatedBuilding} buildingBody
 * @returns {Promise<IBuildingDoc>}
 */
export const createBuilding = async (buildingBody: NewCreatedBuilding): Promise<IBuildingDoc> => {
    if (await Building.findOne({ name: buildingBody.name })) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Building already exists');
    }

    return Building.create(buildingBody);
};

/**
 * Query for buildings
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryBuildings = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
    const buildings = await Building.paginate(filter, options);
    return buildings;
};

/**
 * Get building by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IBuildingDoc | null>}
 */
export const getBuildingById = async (buildingId: mongoose.Types.ObjectId): Promise<IBuildingDoc | null> => Building.findById(buildingId);

/**
 * Update building by id
 * @param {mongoose.Types.ObjectId} buildingId
 * @param {UpdateBuildingBody} updateBody
 * @returns {Promise<IBuildingDoc | null>}
 */
export const updateBuildingById = async (
    buildingId: mongoose.Types.ObjectId,
    updateBody: UpdateBuildingBody
): Promise<IBuildingDoc | null> => {
    const building = await getBuildingById(buildingId);
    if (!building) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Building not found');
    }

    if (updateBody.name && (await Building.isNameTaken(updateBody.name, buildingId))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }

    Object.assign(building, updateBody);
    await building.save();
    return building;
};

/**
 * Delete building by id
 * @param {mongoose.Types.ObjectId} buildingId
 * @returns {Promise<IBuildingDoc | null>}
 */
export const deleteBuildingById = async (buildingId: mongoose.Types.ObjectId): Promise<IBuildingDoc | null> => {
    const building = await getBuildingById(buildingId);
    if (!building) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Building not found');
    }
    await building.deleteOne();
    return building;
};
