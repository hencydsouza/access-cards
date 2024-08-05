import express, { Router } from 'express'
import { validate } from '../../modules/validate';
import { companyValidation, companyController } from '../../modules/company';

const router: Router = express.Router();

router.route('/')
    .post(validate(companyValidation.createCompany), companyController.createCompany)
    .get(validate(companyValidation.getCompanies), companyController.getCompanies);

router.route('/:companyId')
    .get(validate(companyValidation.getCompany), companyController.getCompany)
    .patch(validate(companyValidation.updateCompany), companyController.updateCompany)
    .delete(validate(companyValidation.deleteCompany), companyController.deleteCompany)

export default router