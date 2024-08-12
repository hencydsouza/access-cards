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

/**
 * @swagger
 * tags:
 *   name: Config
 *   description: Configuration management
 */

/**
 * @swagger
 * /config:
 *   post:
 *     summary: Create a new config
 *     tags: [Config]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Config'
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Config'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *   get:
 *     summary: Get all configs
 *     tags: [Config]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of configs
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         description: Config key
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
 *                     $ref: '#/components/schemas/Config'
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
 * /config/{configId}:
 *   get:
 *     summary: Get a config
 *     tags: [Config]
 *     parameters:
 *       - in: path
 *         name: configId
 *         required: true
 *         schema:
 *           type: string
 *         description: Config id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Config'
 *
 *   patch:
 *     summary: Update a config
 *     tags: [Config]
 *     parameters:
 *       - in: path
 *         name: configId
 *         required: true
 *         schema:
 *           type: string
 *         description: Config id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Config'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Config'
 *
 *   delete:
 *     summary: Delete a config
 *     tags: [Config]
 *     parameters:
 *       - in: path
 *         name: configId
 *         required: true
 *         schema:
 *           type: string
 *         description: Config id
 *     responses:
 *       "200":
 *         description: No content
 */
