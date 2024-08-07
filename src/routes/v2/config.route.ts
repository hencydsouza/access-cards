import express, { Router } from 'express'
import { validate } from '../../modules/validate';
import { configController, configValidation } from '../../modules/config';

const router: Router = express.Router();

router.route('/')
    .post(validate(configValidation.createConfig), configController.createConfig)
    .get(validate(configValidation.getConfigs), configController.getConfigs);

router.route('/:configId')
    .get(validate(configValidation.getConfig), configController.getConfigById)
    .patch(validate(configValidation.updateConfig), configController.updateConfig)
    .delete(validate(configValidation.deleteConfig), configController.deleteConfig)

export default router