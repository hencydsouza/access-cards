import Joi from 'joi';
import { NewCreatedAccessLevel } from './accessLevel.interfaces';
import { objectId } from '../validate/custom.validation';

const createAccessLevelBody: Record<keyof NewCreatedAccessLevel, any> = {
    name: Joi.string().required(),
    type: Joi.string().required(),
    description: Joi.string().required(),
    permissions: Joi.array().items(
        Joi.object({
            resource: Joi.string().required(),
            action: Joi.string().required()
        })
    ).required()
}

export const createAccessLevel = {
    body: Joi.object().keys(createAccessLevelBody),
};

export const getAccessLevels = {
    query: Joi.object().keys({
        name: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

export const getAccessLevel = {
    params: Joi.object().keys({
        accessLevelId: Joi.string().custom(objectId),
    }),
};

export const updateAccessLevel = {
    params: Joi.object().keys({
        accessLevelId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string(),
            type: Joi.string(),
            description: Joi.string(),
            permissions: Joi.array().items(
                Joi.object({
                    resource: Joi.string(),
                    action: Joi.string()
                })
            )
        })
};

export const addPermission = {
    params: Joi.object().keys({
        accessLevelId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            permissions: Joi.array().items(
                Joi.object({
                    resource: Joi.string(),
                    action: Joi.string()
                })
            )
        }),
};

export const removePermission = {
    params: Joi.object().keys({
        accessLevelId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            permissions: Joi.array().items(Joi.string())
        }),
}

export const deleteAccessLevel = {
    params: Joi.object().keys({
        accessLevelId: Joi.string().custom(objectId),
    }),
};