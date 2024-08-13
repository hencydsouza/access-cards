import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { authController, authValidation } from '../../modules/employee_auth';

const router: Router = express.Router();
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);

export default router