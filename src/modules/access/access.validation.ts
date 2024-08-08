import Joi from 'joi';
import { objectId } from '../validate/custom.validation';
import { IAccess } from './access.interfaces';

const accessBody: Record<keyof IAccess, any> = {
    accessCardId: Joi.string().custom(objectId).required(),
    companyId: Joi.string().custom(objectId).required(),
    buildingId: Joi.string().custom(objectId).required(),
    accessType: Joi.string().required().valid('login', 'logout', 'access'),
    requiredPermission: Joi.string().optional(),
}

export const Access = {
    body: Joi.object().keys(accessBody),
};