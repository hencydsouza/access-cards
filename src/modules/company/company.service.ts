import httpStatus from "http-status";
import mongoose, { Document } from "mongoose";
import Company from "./company.model";
import { ApiError } from "../errors";
import { IOptions, QueryResult } from '../paginate/paginate';
import { ICompanyDoc, NewCreatedCompany, UpdateCompanyBody } from "./company.interfaces";
import { Building } from "../building";
import { Employee } from "../employee";

/**
 * Create a new company in the system.
 * @param {NewCreatedCompany} companyBody - The new company data to create.
 * @returns {Promise<ICompanyDoc>} - The created company document.
 * @throws {ApiError} - If a company with the same name already exists or the specified building is not found.
 */
export const createCompany = async (companyBody: NewCreatedCompany): Promise<ICompanyDoc> => {
    if (await Company.findOne({ name: companyBody.name })) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Company already exists');
    }

    const targetBuilding = await Building.findOne({ name: companyBody.buildingName })
    if (!targetBuilding) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Building not found')
    }

    if (companyBody.ownedBuildings) {
        await Promise.all(companyBody.ownedBuildings.map(async (buildingObj) => {
            const building = await Building.findOne({ name: buildingObj.buildingName })
            if (!building) {
                throw new ApiError(httpStatus.NOT_FOUND, 'Building not found')
            }
            buildingObj.buildingId = building._id
        }))
    }

    const company = {
        name: companyBody.name,
        buildings: {
            buildingName: targetBuilding.name,
            buildingId: targetBuilding._id
        },
        ownedBuildings: companyBody.ownedBuildings
    }

    return Company.create(company);
};

/**
 * Query for companies
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryCompanies = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult<Document<ICompanyDoc>>> => {
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

    if (updateBody.ownedBuildings) {
        await Promise.all(updateBody.ownedBuildings.map(async (buildingObj) => {
            const building = await Building.findOne({ name: buildingObj.buildingName })
            if (!building) {
                throw new ApiError(httpStatus.NOT_FOUND, 'Building not found')
            }

            // check if building is already owned by a different company
            const companyWithBuilding = await Company.findOne({ 'ownedBuildings.buildingId': building._id })
            if (companyWithBuilding) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Building already owned by another company')
            }

            buildingObj.buildingId = building._id
        }))
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

    // if (company.ownedBuildings && company.ownedBuildings.length > 0) {
    //     throw new ApiError(httpStatus.BAD_REQUEST, 'Company cannot be deleted as it owns buildings')
    // }

    // TODO: Remove company reference from all employees associated with the company

    const employees = await Employee.find({ "company.companyId": companyId });
    if (employees.length > 0) {
        await Employee.updateMany(
            { "company.companyId": companyId },
            {
                $unset: {
                    'company.companyId': 1,
                    'company.buildingId': 1
                }
            }
        );
    }

    // TODO: Delete all access cards associated with the company    

    await company.deleteOne();
    return company;
};
