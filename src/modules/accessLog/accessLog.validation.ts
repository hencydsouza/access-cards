import Joi from 'joi';
import { NewCreatedAccessLog } from './accessLog.interfaces';
import { objectId } from '../validate/custom.validation';

const createAccessLogBody: Record<keyof NewCreatedAccessLog, any> = {
    accessCardId: Joi.string().custom(objectId).required(),
    companyId: Joi.string().custom(objectId).required(),
    buildingId: Joi.string().custom(objectId).required(),
    accessType: Joi.string().required().valid('login', 'logout', 'access'),
    eventType: Joi.string().required().valid('company', 'building', 'product'),
    resource: Joi.string().required(),
    timestamp: Joi.date().optional()
}

export const createAccessLog = {
    body: Joi.object().keys(createAccessLogBody),
};

export const getAccessLogs = {
    query: Joi.object().keys({
        limit: Joi.string(),
        page: Joi.string(),
    }),
};

export const getAccessLog = {
    params: Joi.object().keys({
        accessLogId: Joi.string().custom(objectId),
    }),
};

// export const updateAccessLog = {
//     params: Joi.object().keys({
//         accessLogId: Joi.required().custom(objectId),
//     }),
//     body: Joi.object()
//         .keys({
//             accessCardId: Joi.string().custom(objectId),
//             companyId: Joi.string().custom(objectId),
//             buildingId: Joi.string().custom(objectId),
//             accessType: Joi.string(),
//             timestamp: Joi.date(),
//         })
//         .min(1),
// };

export const deleteAccessLog = {
    params: Joi.object().keys({
        accessLogId: Joi.string().custom(objectId),
    }),
};