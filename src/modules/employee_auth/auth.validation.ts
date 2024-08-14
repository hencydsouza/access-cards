import Joi from 'joi';
import { password } from '../validate/custom.validation';

export const login = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
        resource: Joi.string().required(),
    }),
};

export const logout = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    }),
};

export const refreshTokens = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    }),
};

export const resetPassword = {
    query: Joi.object().keys({
        token: Joi.string().required(),
    }),
    body: Joi.object().keys({
        password: Joi.string().required().custom(password),
    }),
};

export const forgotPassword = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
    }),
};
