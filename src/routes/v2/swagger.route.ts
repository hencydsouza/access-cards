import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerDefinition from '../../modules/swagger/swagger.definition';

const router = express.Router();

const specs = swaggerJsdoc({
    swaggerDefinition,
    apis: ['packages/components-v2.yaml', 'dist/routes/v2/*.js']
});

router.use('/', swaggerUi.serve);
router.get(
    '/',
    swaggerUi.setup(specs, {
        explorer: true,
    })
);

export default router;
