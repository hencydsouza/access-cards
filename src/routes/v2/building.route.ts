import express, { Router } from 'express'
import { validate } from '../../modules/validate';
import { buildingValidation, buildingController } from '../../modules/building';

const router: Router = express.Router();

router.route('/')
    .post(validate(buildingValidation.createBuilding), buildingController.createBuilding)
    .get(validate(buildingValidation.getBuildings), buildingController.getBuildings);

router.route('/:buildingId')
    .get(validate(buildingValidation.getBuilding), buildingController.getBuilding)
    .patch(validate(buildingValidation.updateBuilding), buildingController.updateBuilding)
    .delete(validate(buildingValidation.deleteBuilding), buildingController.deleteBuilding)

export default router