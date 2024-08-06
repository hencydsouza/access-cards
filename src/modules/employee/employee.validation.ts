import Joi from 'joi';
import { NewCreatedEmployee } from './employee.interfaces';
import { objectId } from '../validate/custom.validation';

const createEmployeeBody: Record<keyof NewCreatedEmployee, any> = {
    name: Joi.string().required(),
    companyName: Joi.string().required(),
    buildingName: Joi.string().required(),
    company: Joi.object({
        companyId: Joi.custom(objectId).required(),
        buildingId: Joi.custom(objectId).required()
    }).optional(),
    accessCardId: Joi.custom(objectId).optional(),
    accessLevels: Joi.array().items(
        Joi.object({
            accessLevel: Joi.string().required()
        })
    ).optional()
}

export const createEmployee = {
    body: Joi.object().keys(createEmployeeBody),
};

export const getEmployees = {
    query: Joi.object().keys({
        name: Joi.string()
    }),
};

export const getEmployee = {
    params: Joi.object().keys({
        employeeId: Joi.string().custom(objectId),
    }),
};

export const updateEmployee = {
    params: Joi.object().keys({
        employeeId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string(),
            buildingName: Joi.string(),
            companyName: Joi.string()
        })
        .min(1),
};

export const deleteEmployee = {
    params: Joi.object().keys({
        employeeId: Joi.string().custom(objectId),
    }),
};