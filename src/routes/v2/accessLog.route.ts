import express, { Router } from 'express'
import { validate } from '../../modules/validate';
import { accessLogController, accessLogValidation } from '../../modules/accessLog';

const router: Router = express.Router();

router.route('/')
    .post(validate(accessLogValidation.createAccessLog), accessLogController.createAccessLog)
    .get(validate(accessLogValidation.getAccessLogs), accessLogController.getAccessLogs);

router.route('/:accessLogId')
    .get(validate(accessLogValidation.getAccessLog), accessLogController.getAccessLog)
    .delete(validate(accessLogValidation.deleteAccessLog), accessLogController.deleteAccessLog)
    // .patch(validate(accessLogValidation.updateAccessLog), accessLogController.updateAccessLog)

export default router