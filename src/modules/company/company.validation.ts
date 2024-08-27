import Joi from 'joi';
import { NewCreatedCompany } from './company.interfaces';
import { objectId } from '../validate/custom.validation';


const createCompanyBody: Record<keyof NewCreatedCompany, any> = {
    name: Joi.string().required(),
    buildingId: Joi.string().required(),
    ownedBuildings: Joi.array().items({
        buildingId: Joi.string()
    }).min(1).optional()
}

export const createCompany = {
    body: Joi.object().keys(createCompanyBody),
};

export const getCompanies = {
    query: Joi.object().keys({
        name: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

export const getCompany = {
    params: Joi.object().keys({
        companyId: Joi.string().custom(objectId),
    }),
};

export const updateCompany = {
    params: Joi.object().keys({
        companyId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string(),
            buildingId: Joi.string(),
            ownedBuildings: Joi.array().items({
                buildingId: Joi.string(),
                buildingName: Joi.string().optional()
            }).optional()
        })
        .min(1),
};

export const deleteCompany = {
    params: Joi.object().keys({
        companyId: Joi.string().custom(objectId),
    }),
};