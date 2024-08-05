import Joi from 'joi';
import { NewCreatedBuilding } from './building.interfaces';
import { objectId } from '../validate/custom.validation';


const createBuildingBody: Record<keyof NewCreatedBuilding, any> = {
    name: Joi.string().required(),
    address: Joi.string().required(),
    ownerCompany: Joi.string().optional(),
    ownerCompanyName: Joi.string().optional()
}

export const createBuilding = {
    body: Joi.object().keys(createBuildingBody),
};

export const getBuildings = {
    query: Joi.object().keys({
        name: Joi.string(),
        address: Joi.string()
    }),
};

export const getBuilding = {
    params: Joi.object().keys({
        buildingId: Joi.string().custom(objectId),
    }),
};

export const updateBuilding = {
    params: Joi.object().keys({
        buildingId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string(),
            address: Joi.string(),
            ownerCompanyName: Joi.string()
        })
        .min(1),
};

export const deleteBuilding = {
    params: Joi.object().keys({
        buildingId: Joi.string().custom(objectId),
    }),
};