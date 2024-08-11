import express, { Router } from 'express'
import { validate } from '../../modules/validate';
import { accessLevelController, accessLevelValidation } from '../../modules/accessLevel';

const router: Router = express.Router();

router.route('/')
    .post(validate(accessLevelValidation.createAccessLevel), accessLevelController.createAccessLevel)
    .get(validate(accessLevelValidation.getAccessLevels), accessLevelController.getAccessLevels);

router.route('/add-permission/:accessLevelId')
    .patch(validate(accessLevelValidation.addPermissionInterface), accessLevelController.addPermissionToAccessLevel)

router.route('/:accessLevelId')
    .get(validate(accessLevelValidation.getAccessLevel), accessLevelController.getAccessLevel)
    .patch(validate(accessLevelValidation.updateAccessLevel), accessLevelController.updateAccessLevel)
    .delete(validate(accessLevelValidation.deleteAccessLevel), accessLevelController.deleteAccessLevel)

export default router