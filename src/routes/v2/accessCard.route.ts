import express, { Router } from 'express'
import { validate } from '../../modules/validate';
import { accessCardController, accessCardValidation } from '../../modules/accessCard';
import authMiddleware from '../../modules/employee_auth/auth.middleware';

const router: Router = express.Router();

router.route('/')
    .post(authMiddleware(['company', 'building', 'product']), validate(accessCardValidation.createAccessCard), accessCardController.createAccessCard)
    .get(authMiddleware(['company', 'building', 'product']), validate(accessCardValidation.getAccessCards), accessCardController.getAccessCards);

router.route('/:accessCardId')
    .get(authMiddleware(['company', 'building', 'product']), validate(accessCardValidation.getAccessCard), accessCardController.getAccessCard)
    .patch(authMiddleware(['company', 'building', 'product']), validate(accessCardValidation.updateAccessCard), accessCardController.updateAccessCard)
    .delete(authMiddleware(['company', 'building', 'product']), validate(accessCardValidation.deleteAccessCard), accessCardController.deleteAccessCard)

export default router

/**
 * @swagger
 * tags:
 *   name: AccessCards
 *   description: Access card management
 */

/**
 * @swagger
 * /access-card:
 *   post:
 *     summary: Create a new access card
 *     tags: [AccessCards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccessCard'
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessCard'
 *   get:
 *     summary: Get all access cards
 *     tags: [AccessCards]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of access cards
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
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
 *                     $ref: '#/components/schemas/AccessCard'
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
 * /access-card/{id}:
 *   get:
 *     summary: Get an access card
 *     tags: [AccessCards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Access card id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessCard'
 *
 *   patch:
 *     summary: Update an access card
 *     tags: [AccessCards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Access card id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccessCard'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessCard'
 *
 *   delete:
 *     summary: Delete an access card
 *     tags: [AccessCards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Access card id
 *     responses:
 *       "200":
 *         description: No content
 */
