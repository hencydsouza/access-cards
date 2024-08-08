import express, { Router } from 'express'
import { validate } from '../../modules/validate';
import { accessController, accessValidation } from '../../modules/access';

const router: Router = express.Router();

router.route('/')
    .post(validate(accessValidation.Access), accessController.access)

export default router