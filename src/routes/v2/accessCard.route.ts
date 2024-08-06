import express, { Router } from 'express'
import { validate } from '../../modules/validate';
import { accessCardController, accessCardValidation } from '../../modules/accessCard';

const router: Router = express.Router();

router.route('/')
    .post(validate(accessCardValidation.createAccessCard), accessCardController.createAccessCard)
    .get(validate(accessCardValidation.getAccessCards), accessCardController.getAccessCards);

router.route('/:accessCardId')
    .get(validate(accessCardValidation.getAccessCard), accessCardController.getAccessCard)
    .patch(validate(accessCardValidation.updateAccessCard), accessCardController.updateAccessCard)
    .delete(validate(accessCardValidation.deleteAccessCard), accessCardController.deleteAccessCard)

export default router