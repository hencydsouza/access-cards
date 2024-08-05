import httpStatus from "http-status";
import mongoose from "mongoose";
import Company from "./company.model";
import { ApiError } from "../errors";
import { IOptions, QueryResult } from '../paginate/paginate';
import { ICompanyDoc, NewCreatedCompany, UpdateCompanyBody } from "./company.interfaces";
import { Building } from "../building";

/**
 * Create a Company
 * @param {NewCreatedCompany} companyBody
 * @returns {Promise<ICompanyDoc>}
 */
export const createCompany = async (companyBody: NewCreatedCompany): Promise<ICompanyDoc> => {
    if (await Company.findOne({ name: companyBody.name })) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Company already exists');
    }

    const targetBuilding = await Building.findOne({ name: companyBody.buildingName })
    if (!targetBuilding) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Building not found')
    }

    // if (companyBody.buildingsOwned) {
    //     for (let building of companyBody.buildingsOwned) {
    //         const tempBuilding = await Building.findOne({ name: building.buildingName })
    //         if (!tempBuilding)
    //             throw new ApiError(httpStatus.NOT_FOUND, 'Owned building not found')
    //     }
    // }

    const company = {
        name: companyBody.name,
        buildings: {
            buildingName: targetBuilding.name,
            buildingId: targetBuilding._id
        },
        // buildingsOwned: companyBody.buildingsOwned
    }

    return Company.create(company);
};

/**
 * Query for companies
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryCompanies = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
    const companies = await Company.paginate(filter, options);
    return companies;
};

/**
 * Get company by companyId
 * @param {mongoose.Types.ObjectId} companyId
 * @returns {Promise<ICompanyDoc | null>}
 */
export const getCompanyById = async (companyId: mongoose.Types.ObjectId): Promise<ICompanyDoc | null> => Company.findById(companyId);

/**
 * Update company by id
 * @param {mongoose.Types.ObjectId} companyId
 * @param {UpdateCompanyBody} updateBody
 * @returns {Promise<ICompanyDoc | null>}
 */
export const updateCompanyById = async (
    companyId: mongoose.Types.ObjectId,
    updateBody: UpdateCompanyBody
): Promise<ICompanyDoc | null> => {
    const company = await getCompanyById(companyId);
    if (!company) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
    }

    if (updateBody.name && (await Company.isNameTaken(updateBody.name, companyId))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }

    if (updateBody.buildingName) {
        const targetBuilding = await Building.findOne({ name: updateBody.buildingName })
        if (!targetBuilding) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Building not found')
        }
        delete updateBody.buildingName

        Object.assign(updateBody, { buildings: { buildingName: targetBuilding.name, buildingId: targetBuilding._id } })
    }

    Object.assign(company, updateBody);
    await company.save();
    return company;
};

/**
 * Delete company by id
 * @param {mongoose.Types.ObjectId} companyId
 * @returns {Promise<ICompanyDoc | null>}
 */
export const deleteCompanyById = async (companyId: mongoose.Types.ObjectId): Promise<ICompanyDoc | null> => {
    const company = await getCompanyById(companyId);
    if (!company) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
    }
    await company.deleteOne();
    return company;
};
