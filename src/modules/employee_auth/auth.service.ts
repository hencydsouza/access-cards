import httpStatus from "http-status";
import { getEmployeeByEmail, getEmployeeById, updateEmployeeById } from "../employee/employee.service";
import { ApiError } from "../errors";
import { IEmployeeDoc, IEmployeeWithTokens } from "../employee/employee.interfaces";
import { Token, tokenTypes } from "../employee_token";
import mongoose from "mongoose";
import { generateAuthTokens, verifyToken } from "../employee_token/token.service";

export const loginEmployeeWithEmailAndPassword = async (email: string, password: string): Promise<IEmployeeDoc> => {
    const employee = await getEmployeeByEmail(email);
    if (!employee || !(await employee.isPasswordMatch(password))) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
    }
    return employee;
};

export const logout = async (refreshToken: string): Promise<void> => {
    const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
    if (!refreshTokenDoc) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
    }
    await refreshTokenDoc.deleteOne();
};

export const refreshAuth = async (refreshToken: string): Promise<IEmployeeWithTokens> => {
    try {
        const refreshTokenDoc = await verifyToken(refreshToken, tokenTypes.REFRESH);
        const employee = await getEmployeeById(new mongoose.Types.ObjectId(refreshTokenDoc.employee));
        if (!employee) {
            throw new Error();
        }
        await refreshTokenDoc.deleteOne();
        const tokens = await generateAuthTokens(employee);
        return { employee, tokens };
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }
};

export const resetPassword = async (resetPasswordToken: any, newPassword: string): Promise<void> => {
    try {
        const resetPasswordTokenDoc = await verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
        const employee = await getEmployeeById(new mongoose.Types.ObjectId(resetPasswordTokenDoc.employee));
        if (!employee) {
            throw new Error();
        }
        await updateEmployeeById(employee.id, { password: newPassword });
        await Token.deleteMany({ employee: employee.id, type: tokenTypes.RESET_PASSWORD });
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
    }
};