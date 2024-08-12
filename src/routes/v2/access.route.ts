import express, { Router } from 'express'
import { validate } from '../../modules/validate';
import { accessController, accessValidation } from '../../modules/access';

const router: Router = express.Router();

router.route('/')
    .post(validate(accessValidation.Access), accessController.access)

export default router

/**
 * @swagger
 * /access:
 *   post:
 *     summary: Access endpoint
 *     tags: [Access]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Access'
 *     responses:
 *       200:
 *         description: Successful access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessResponse'
 */
