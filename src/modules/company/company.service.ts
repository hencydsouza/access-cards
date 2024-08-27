import httpStatus from "http-status";
import mongoose, { Document } from "mongoose";
import Company from "./company.model";
import { ApiError } from "../errors";
import { IOptions, QueryResult } from '../paginate/paginate';
import { ICompanyDoc, NewCreatedCompany, UpdateCompanyBody } from "./company.interfaces";
import { Building } from "../building";
import { Employee } from "../employee";
import { IEmployeeDoc } from "../employee/employee.interfaces";

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

    const targetBuilding = await Building.findById(companyBody.buildingId)
    if (!targetBuilding) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Building not found')
    }

    if (companyBody.ownedBuildings) {
        await Promise.all(companyBody.ownedBuildings.map(async (buildingObj) => {
            const building = await Building.findById(buildingObj.buildingId)
            if (!building) {
                throw new ApiError(httpStatus.NOT_FOUND, 'Building not found')
            }

            // check if building is already owned by a different company and remove it from that company
            const companyWithBuilding = await Company.findOne({ 'ownedBuildings.buildingId': building._id })
            if (companyWithBuilding) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Building is already owned by a different company')
            }

            buildingObj.buildingId = building._id
            buildingObj.buildingName = building.name
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

export const getAllCompanyNames = async () => {
    const result = await Company.aggregate([
        {
            '$project': {
                'name': 1,
                'ownedBuildings': 1
            }
        }
    ])
    return result
}

/**
 * Update company by id
 * @param {mongoose.Types.ObjectId} companyId
 * @param {UpdateCompanyBody} updateBody
 * @returns {Promise<ICompanyDoc | null>}
 */
export const updateCompanyById = async (
    companyId: mongoose.Types.ObjectId,
    updateBody: UpdateCompanyBody,
    scope: string,
    client: IEmployeeDoc
): Promise<ICompanyDoc | null> => {
    const company = await getCompanyById(companyId);
    if (!company) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
    }

    if (scope === 'company' && company._id.toString() !== client.company.companyId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Cannot update company');
    }
    if (scope === 'building' && company.buildings.buildingId.toString() !== client.company.buildingId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Cannot update company');
    }

    if (updateBody.name && (await Company.isNameTaken(updateBody.name, companyId))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }

    if (updateBody.buildingId) {
        const targetBuilding = await Building.findById(updateBody.buildingId)
        if (!targetBuilding) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Building not found')
        }
        delete updateBody.buildingId

        Object.assign(updateBody, { buildings: { buildingName: targetBuilding.name, buildingId: targetBuilding._id } })
    }

    if (updateBody.ownedBuildings && updateBody.ownedBuildings.length > 0) {
        await Promise.all(updateBody.ownedBuildings.map(async (buildingObj) => {
            if (buildingObj.buildingName === "none") {
                company.ownedBuildings = company.ownedBuildings?.filter((building) => building.buildingId.toString() !== buildingObj.buildingId?.toString()) || []
                return
            }

            const building = await Building.findById(new mongoose.Types.ObjectId(buildingObj.buildingId))
            if (!building) {
                throw new ApiError(httpStatus.NOT_FOUND, 'Building not found')
            }

            // check if building is already owned by a different company and remove it from that company
            const companyWithBuilding = await Company.findOne({ 'ownedBuildings.buildingId': building._id })
            // if(companyWithBuilding){
            //     throw new ApiError(httpStatus.BAD_REQUEST, 'Building is being owned in a company')
            // }
            if (companyWithBuilding) {
                companyWithBuilding.ownedBuildings = companyWithBuilding.ownedBuildings?.filter((building) => building.buildingId.toString() !== buildingObj.buildingId?.toString()) || []
                await companyWithBuilding.save()
            }

            company.ownedBuildings?.push({ buildingId: building._id, buildingName: buildingObj.buildingName ? buildingObj.buildingName : building.name })
        }))
    } else {
        company.ownedBuildings = []
        // console.log('here')
    }

    delete updateBody.ownedBuildings

    Object.assign(company, { ...updateBody, ownedBuildings: company.ownedBuildings });
    await company.save();
    return company;
};

/**
 * Delete company by id
 * @param {mongoose.Types.ObjectId} companyId
 * @returns {Promise<ICompanyDoc | null>}
 */
export const deleteCompanyById = async (
    companyId: mongoose.Types.ObjectId,
    scope: string,
    client: IEmployeeDoc
): Promise<ICompanyDoc | null> => {
    const company = await getCompanyById(companyId);
    if (!company) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
    }

    if (scope === 'company' && company._id.toString() !== client.company.companyId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Cannot delete company');
    }
    if (scope === 'building' && company.buildings.buildingId.toString() !== client.company.buildingId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Cannot delete company');
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
