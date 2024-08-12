import express, { Router } from 'express'
import { validate } from '../../modules/validate';
import { accessLogController, accessLogValidation } from '../../modules/accessLog';

const router: Router = express.Router();

router.route('/')
    .post(validate(accessLogValidation.createAccessLog), accessLogController.createAccessLog)
    .get(validate(accessLogValidation.getAccessLogs), accessLogController.getAccessLogs);

router.route('/reConfigureAccessLogs/')
    .get(accessLogController.reConfigureAccessLogsController)

router.route('/reConfigureAccessLogs/:accessLogInterval')
    .get(accessLogController.reConfigureAccessLogsByValue)

router.route('/:accessLogId')
    .get(validate(accessLogValidation.getAccessLog), accessLogController.getAccessLog)
    .delete(validate(accessLogValidation.deleteAccessLog), accessLogController.deleteAccessLog)

export default router

/**
 * @swagger
 * tags:
 *   name: AccessLogs
 *   description: Access log management
 */

/**
 * @swagger
 * /access-log:
 *   post:
 *     summary: Create a new access log
 *     tags: [AccessLogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccessLog'
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessLog'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *   get:
 *     summary: Get all access logs
 *     tags: [AccessLogs]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of access logs
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
 *                     $ref: '#/components/schemas/AccessLog'
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
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /access-log/reConfigureAccessLogs:
 *   get:
 *     summary: Reconfigure access logs
 *     tags: [AccessLogs]
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /access-log/reConfigureAccessLogs/{accessLogInterval}:
 *   get:
 *     summary: Reconfigure access logs by value
 *     tags: [AccessLogs]
 *     parameters:
 *       - in: path
 *         name: accessLogInterval
 *         required: true
 *         schema:
 *           type: string
 *         description: Access log interval
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /access-log/{accessLogId}:
 *   get:
 *     summary: Get an access log
 *     tags: [AccessLogs]
 *     parameters:
 *       - in: path
 *         name: accessLogId
 *         required: true
 *         schema:
 *           type: string
 *         description: Access log id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessLog'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Delete an access log
 *     tags: [AccessLogs]
 *     parameters:
 *       - in: path
 *         name: accessLogId
 *         required: true
 *         schema:
 *           type: string
 *         description: Access log id
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
