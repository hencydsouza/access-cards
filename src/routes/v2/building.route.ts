import express, { Router } from 'express'
import { validate } from '../../modules/validate';
import { buildingValidation, buildingController } from '../../modules/building';
import authMiddleware from '../../modules/employee_auth/auth.middleware';

const router: Router = express.Router();

router.route('/buildingNames').get(buildingController.getBuildingNames)

router.route('/')
    .post(authMiddleware(['product']), validate(buildingValidation.createBuilding), buildingController.createBuilding)
    // .get(authMiddleware(['product']), validate(buildingValidation.getBuildings), buildingController.getBuildings);
    .get(authMiddleware(['product']), buildingController.getAllBuildings);

router.route('/:buildingId')
    // .get(authMiddleware(['product']), validate(buildingValidation.getBuilding), buildingController.getBuilding)
    .get(authMiddleware(['product']), validate(buildingValidation.getBuilding), buildingController.getBuildingDetails)
    .patch(authMiddleware(['product']), validate(buildingValidation.updateBuilding), buildingController.updateBuilding)
    .delete(authMiddleware(['product']), validate(buildingValidation.deleteBuilding), buildingController.deleteBuilding)

export default router

/**
 * @swagger
 * tags:
 *   name: Buildings
 *   description: Building management
 */

/**
 * @swagger
 * /building:
 *   post:
 *     summary: Create a new building
 *     tags: [Buildings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Building'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Building'
 *   get:
 *     summary: Get all buildings
 *     tags: [Buildings]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of buildings
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         description: address
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: building name
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Building'
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
 * /building/{id}:
 *   get:
 *     summary: Get a building
 *     tags: [Buildings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Building id
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Building'
 *
 *   patch:
 *     summary: Update a building
 *     tags: [Buildings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Building id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BuildingInput'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Building'
 *
 *   delete:
 *     summary: Delete a building
 *     tags: [Buildings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Building id
 *     responses:
 *       204:
 *         description: No content
 */
