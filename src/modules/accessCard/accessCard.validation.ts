import Joi from 'joi';
import { NewCreatedAccessCard } from './accessCard.interfaces';
import { objectId } from '../validate/custom.validation';

const createAccessCardBody: Record<keyof NewCreatedAccessCard, any> = {
    cardNumber: Joi.string().optional(),
    cardHolder: Joi.object({
        employeeId: Joi.string().custom(objectId).required()
    }).required(),
    issued_at: Joi.date().optional(),
    valid_until: Joi.date().optional(),
    is_active: Joi.boolean().optional()
}

export const createAccessCard = {
    body: Joi.object().keys(createAccessCardBody),
};

export const getAccessCards = {
    query: Joi.object().keys({
        cardNumber: Joi.string()
    }),
};

export const getAccessCard = {
    params: Joi.object().keys({
        accessCardId: Joi.string().custom(objectId),
    }),
};

export const updateAccessCard = {
    params: Joi.object().keys({
        accessCardId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            cardNumber: Joi.string(),
            cardHolder: Joi.object({
                employeeId: Joi.string().custom(objectId)
            }),
            issued_at: Joi.date(),
            valid_until: Joi.date(),
            is_active: Joi.boolean()
        })
        .min(1),
};

export const deleteAccessCard = {
    params: Joi.object().keys({
        accessCardId: Joi.string().custom(objectId),
    }),
};