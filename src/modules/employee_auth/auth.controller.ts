import { authService } from '.';
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { tokenService } from '../employee_token';
import httpStatus from 'http-status';

export const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password, resource } = req.body;
    const employee = await authService.loginEmployeeWithEmailAndPassword(email, password, resource);
    const tokens = await tokenService.generateAuthTokens(employee, resource);
    res.cookie('access_cards', {
        accessToken: tokens.access.token,
        refreshToken: tokens.refresh.token,
    },{httpOnly: true, secure: true}).send({ employee, tokens });
    // res.send({ message: `Logged in as ${employee.name}`, employee });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
    await authService.logout(req.body.refreshToken);
    req.cookies['access_cards'] = null;
    res.status(httpStatus.NO_CONTENT).send();
});

export const refreshTokens = catchAsync(async (req: Request, res: Response) => {
    const userWithTokens = await authService.refreshAuth(req.body.refreshToken);
    res.cookie('access_cards', {
        accessToken: userWithTokens.tokens.access.token,
        refreshToken: userWithTokens.tokens.refresh.token,
    },{httpOnly: true, secure: true}).send({ ...userWithTokens });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
    // await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
    res.status(httpStatus.OK).json({ resetPasswordToken });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
    await authService.resetPassword(req.query['token'], req.body.password);
    res.status(httpStatus.NO_CONTENT).send();
});