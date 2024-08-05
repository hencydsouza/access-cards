import express, { Router } from 'express';
import config from '../../config/config';
import docsRoute from './swagger.route';
import buildingRoute from './building.route'

const router = express.Router();

interface IRoute {
    path: string;
    route: Router;
}

const defaultIRoute: IRoute[] = [
    {
        path: '/building',
        route: buildingRoute,
    },
];

const devIRoute: IRoute[] = [
    // IRoute available only in development mode
    {
        path: '/docs',
        route: docsRoute,
    },
];

defaultIRoute.forEach((route) => {
    router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
    devIRoute.forEach((route) => {
        router.use(route.path, route.route);
    });
}

export default router;