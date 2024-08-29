import express, { Router } from 'express'
import { validate } from '../../modules/validate';
import { employeeValidation, employeeController } from '../../modules/employee';
import authMiddleware from '../../modules/employee_auth/auth.middleware';

const router: Router = express.Router();

router.route('/employeeNames').get(authMiddleware(['company', 'building', 'product']), employeeController.getEmployeeNames)

router.route('/')
    .post(authMiddleware(['company', 'building', 'product']), validate(employeeValidation.createEmployee), employeeController.createEmployee)
    .get(authMiddleware(['company', 'building', 'product']), validate(employeeValidation.getEmployees), employeeController.getEmployees);

router.route('/:employeeId')
    .get(authMiddleware(['company', 'building', 'product']), validate(employeeValidation.getEmployee), employeeController.getEmployee)
    .patch(authMiddleware(['company', 'building', 'product']), validate(employeeValidation.updateEmployee), employeeController.updateEmployee)
    .delete(authMiddleware(['company', 'building', 'product']), validate(employeeValidation.deleteEmployee), employeeController.deleteEmployee)

export default router

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management
 */

/**
 * @swagger
 * /employee:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *   get:
 *     summary: Get all employees
 *     tags: [Employees]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of employees
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Employee Name
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 * 
 * /employee/{id}:
 *   get:
 *     summary: Get an employee
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *   patch:
 *     summary: Update an employee
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *   delete:
 *     summary: Delete an employee
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee id
 *     responses:
 *       "200":
 *         description: No content
 */
