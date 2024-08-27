import httpStatus from "http-status";
import mongoose, { Aggregate, Document } from "mongoose";
import Building from "./building.model";
import { ApiError } from "../errors";
import { IOptions, QueryResult } from '../paginate/paginate';
import { IBuildingDetails, IBuildingDoc, NewCreatedBuilding, UpdateBuildingBody } from "./building.interfaces";
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

export const getAllBuildings = async (): Promise<IBuildingDoc[] | null> => {
    const buildings = await Building.aggregate([
        {
            '$lookup': {
                'from': 'companies',
                'localField': '_id',
                'foreignField': 'ownedBuildings.buildingId',
                'as': 'company',
                'pipeline': [
                    {
                        '$project': {
                            'name': 1
                        }
                    }
                ]
            }
        }, {
            '$project': {
                '__v': 0
            }
        }
    ])
    return buildings
}

export const getAllBuildingNames = async () => {
    const result = await Building.find().select({ name: 1, _id: 1 })
    return result
}

/**
 * Get building by buildingId
 * @param {mongoose.Types.ObjectId} buildingId
 * @returns {Promise<IBuildingDoc | null>}
 */
export const getBuildingById = async (buildingId: mongoose.Types.ObjectId): Promise<IBuildingDoc | null> => Building.findById(buildingId);
export const getBuildingDetails = async (buildingId: mongoose.Types.ObjectId): Promise<IBuildingDetails[] | null> => {
    const result: Aggregate<IBuildingDetails[]> = Building.aggregate<IBuildingDetails>([
        {
            '$match': {
                '_id': new mongoose.Types.ObjectId(buildingId)
            }
        }, {
            '$lookup': {
                'from': 'companies',
                'localField': '_id',
                'foreignField': 'ownedBuildings.buildingId',
                'as': 'company',
                'pipeline': [
                    {
                        '$project': {
                            'name': 1
                        }
                    }
                ]
            }
        }, {
            '$project': {
                '__v': 0
            }
        }
    ])
    return result
};

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

    const ownerCompany = await Company.findOne({ "ownedBuildings.buildingName": building.name });
    if (ownerCompany) {
        ownerCompany.ownedBuildings = ownerCompany?.ownedBuildings?.filter((item) => item.buildingName !== building.name) || []
        await ownerCompany?.save()
    }

    await building.deleteOne();
    return building;
};
