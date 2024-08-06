import express, { Router } from 'express'
import { validate } from '../../modules/validate';
import { employeeValidation, employeeController } from '../../modules/employee';

const router: Router = express.Router();

router.route('/')
    .post(validate(employeeValidation.createEmployee), employeeController.createEmployee)
    .get(validate(employeeValidation.getEmployees), employeeController.getEmployees);

router.route('/:employeeId')
    .get(validate(employeeValidation.getEmployee), employeeController.getEmployee)
    .patch(validate(employeeValidation.updateEmployee), employeeController.updateEmployee)
    .delete(validate(employeeValidation.deleteEmployee), employeeController.deleteEmployee)

export default router