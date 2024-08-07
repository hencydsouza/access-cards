import Joi from 'joi';
import { NewCreatedConfig } from './config.interfaces';
import { objectId } from '../validate/custom.validation';

const createConfigBody: Record<keyof NewCreatedConfig, any> = {
    key: Joi.string().required(),
    value: Joi.number().required(),
}

export const createConfig = {
    body: Joi.object().keys(createConfigBody),
};

export const getConfigs = {
    query: Joi.object().keys({
        key: Joi.string(),
        value: Joi.number()
    }),
};

export const getConfig = {
    params: Joi.object().keys({
        configId: Joi.string().custom(objectId),
    }),
};

export const updateConfig = {
    params: Joi.object().keys({
        configId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            key: Joi.string(),
            value: Joi.number()
        })
        .min(1),
};

export const deleteConfig = {
    params: Joi.object().keys({
        configId: Joi.string().custom(objectId),
    }),
};