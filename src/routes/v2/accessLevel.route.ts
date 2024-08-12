import express, { Router } from 'express'
import { validate } from '../../modules/validate';
import { accessLevelController, accessLevelValidation } from '../../modules/accessLevel';

const router: Router = express.Router();

router.route('/')
    .post(validate(accessLevelValidation.createAccessLevel), accessLevelController.createAccessLevel)
    .get(validate(accessLevelValidation.getAccessLevels), accessLevelController.getAccessLevels);

router.route('/add-permission/:accessLevelId')
    .patch(validate(accessLevelValidation.addPermission), accessLevelController.addPermissionToAccessLevel)
    .delete(validate(accessLevelValidation.removePermission), accessLevelController.removePermissionFromAccessLevel)

router.route('/:accessLevelId')
    .get(validate(accessLevelValidation.getAccessLevel), accessLevelController.getAccessLevel)
    .patch(validate(accessLevelValidation.updateAccessLevel), accessLevelController.updateAccessLevel)
    .delete(validate(accessLevelValidation.deleteAccessLevel), accessLevelController.deleteAccessLevel)

export default router

/**
 * @swagger
 * tags:
 *   name: Access Levels
 *   description: Access level management
 */

/**
 * @swagger
 * /access-level:
 *   post:
 *     summary: Create a new access level
 *     tags: [Access Levels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccessLevel'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessLevel'
 *   get:
 *     summary: Get all access levels
 *     tags: [Access Levels]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of access levels
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
 *         description: Access level name
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
 *                     $ref: '#/components/schemas/AccessLevel'
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
 * /access-level/add-permission/{accessLevelId}:
 *   patch:
 *     summary: Add a permission to an access level
 *     tags: [Access Levels]
 *     parameters:
 *       - in: path
 *         name: accessLevelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Access level id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissionId
 *             properties:
 *               permissionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessLevel'
 *   delete:
 *     summary: Remove a permission from an access level
 *     tags: [Access Levels]
 *     parameters:
 *       - in: path
 *         name: accessLevelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Access level id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissionId
 *             properties:
 *               permissionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessLevel'
 * 
 * /access-level/{accessLevelId}:
 *   get:
 *     summary: Get an access level
 *     tags: [Access Levels]
 *     parameters:
 *       - in: path
 *         name: accessLevelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Access level id
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessLevel'
 *   patch:
 *     summary: Update an access level
 *     tags: [Access Levels]
 *     parameters:
 *       - in: path
 *         name: accessLevelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Access level id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessLevel'
 *   delete:
 *     summary: Delete an access level
 *     tags: [Access Levels]
 *     parameters:
 *       - in: path
 *         name: accessLevelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Access level id
 *     responses:
 *       204:
 *         description: No content
 */
