import httpStatus from "http-status";
import mongoose, { Document } from "mongoose";
import Building from "./building.model";
import { ApiError } from "../errors";
import { IOptions, QueryResult } from '../paginate/paginate';
import { IBuildingDoc, NewCreatedBuilding, UpdateBuildingBody } from "./building.interfaces";
import { Company } from "../company";

/**
 * Create a building
 * @param {NewCreatedBuilding} buildingBody
 * @returns {Promise<IBuildingDoc>}
 */
export const createBuilding = async (buildingBody: NewCreatedBuilding): Promise<IBuildingDoc> => {
    if (await Building.findOne({ name: buildingBody.name })) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Building already exists');
    }

    // if (buildingBody.ownerCompanyName) {
    //     const ownerCompany = await Company.findOne({ name: buildingBody.ownerCompanyName });
    //     if (!ownerCompany) {
    //         throw new ApiError(httpStatus.BAD_REQUEST, 'Owner company not found');
    //     }
    //     buildingBody.ownerCompany = ownerCompany._id;
    // }

    return Building.create({ name: buildingBody.name, address: buildingBody.address });
};

/**
 * Query for buildings
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryBuildings = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult<Document<IBuildingDoc>>> => {
    const buildings = await Building.paginate(filter, options);
    return buildings;
};

/**
 * Get building by buildingId
 * @param {mongoose.Types.ObjectId} buildingId
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

    // if (updateBody.ownerCompanyName) {
    //     const ownerCompany = await Company.findOne({ name: updateBody.ownerCompanyName });
    //     if (!ownerCompany) {
    //         throw new ApiError(httpStatus.BAD_REQUEST, 'Owner company not found');
    //     }
    //     updateBody.ownerCompany = ownerCompany._id;
    // }

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

    const companyWithBuilding = await Company.findOne({ 'buildings.buildingId': new mongoose.Types.ObjectId(buildingId) });
    if (companyWithBuilding) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Building is being used in a company');
    }

    await building.deleteOne();
    return building;
};
