import express, { Router } from 'express'
// import { validate } from '../../modules/validate';
import authMiddleware from '../../modules/employee_auth/auth.middleware';
import { dashboardController } from '../../modules/dashboard';

const router: Router = express.Router();

router.route('/')
    // .get(dashboardController.dashboard)
    .get(authMiddleware(['product', 'company', 'building']), dashboardController.dashboard)

export default router