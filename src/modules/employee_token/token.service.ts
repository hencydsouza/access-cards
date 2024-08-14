import mongoose from "mongoose";
import moment, { Moment } from 'moment';
import config from '../../config/config';
import jwt from 'jsonwebtoken';
import { AccessAndRefreshTokens, ITokenDoc } from "./token.interfaces";
import Token from "./token.model";
import { ApiError } from "../errors";
import httpStatus from "http-status";
import { IEmployeeDoc } from "../employee/employee.interfaces";
import tokenTypes from "./token.types";
import { employeeService } from "../employee";

export const generateToken = (
    employeeId: mongoose.Types.ObjectId,
    expires: Moment,
    scope: string,
    type: string,
    secret: string = config.jwt.secret
): string => {
    const payload = {
        sub: employeeId,
        iat: moment().unix(),
        exp: expires.unix(),
        scope: scope,
        type,
    };
    return jwt.sign(payload, secret);
};

export const saveToken = async (
    token: string,
    employeeId: mongoose.Types.ObjectId,
    expires: Moment,
    scope: string,
    type: string,
    blacklisted: boolean = false
): Promise<ITokenDoc> => {
    const tokenDoc = await Token.create({
        token,
        employee: employeeId,
        expires: expires.toDate(),
        scope,
        type,
        blacklisted,
    });
    return tokenDoc;
};

export const verifyToken = async (token: string, type: string): Promise<ITokenDoc> => {
    const payload = jwt.verify(token, config.jwt.secret);
    if (typeof payload.sub !== 'string') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'bad user');
    }
    const tokenDoc = await Token.findOne({
        token,
        type,
        employee: payload.sub,
        blacklisted: false,
    });
    if (!tokenDoc) {
        throw new Error('Token not found');
    }
    return tokenDoc;
};

export const generateAuthTokens = async (employee: IEmployeeDoc, scope: string): Promise<AccessAndRefreshTokens> => {
    const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = generateToken(employee.id, accessTokenExpires, scope, tokenTypes.ACCESS);

    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
    const refreshToken = generateToken(employee.id, refreshTokenExpires, scope, tokenTypes.REFRESH);
    await saveToken(refreshToken, employee.id, refreshTokenExpires, scope, tokenTypes.REFRESH);

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate(),
        },
    };
};

export const generateResetPasswordToken = async (email: string): Promise<string> => {
    const employee = await employeeService.getEmployeeByEmail(email);
    if (!employee) {
        throw new ApiError(httpStatus.NO_CONTENT, '');
    }
    const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
    const resetPasswordToken = generateToken(employee.id, expires, 'password', tokenTypes.RESET_PASSWORD);
    await saveToken(resetPasswordToken, employee.id, expires, 'password', tokenTypes.RESET_PASSWORD);
    return resetPasswordToken;
};

// export const generateVerifyEmailToken = async (employee: IEmployeeDoc): Promise<string> => {
//     const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
//     const verifyEmailToken = generateToken(employee.id, expires, tokenTypes.VERIFY_EMAIL);
//     await saveToken(verifyEmailToken, employee.id, expires, tokenTypes.VERIFY_EMAIL);
//     return verifyEmailToken;
// };
