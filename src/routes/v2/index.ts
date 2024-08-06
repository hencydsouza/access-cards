import express, { Router } from 'express';
import config from '../../config/config';
import docsRoute from './swagger.route';
import buildingRoute from './building.route'
import companyRoute from './company.route'
import accessLevelRoute from './accessLevel.route'
import employeeRoute from './employee.route'

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
    {
        path: '/company',
        route: companyRoute
    },
    {
        path: '/access-level',
        route: accessLevelRoute
    },
    {
        path: '/employee',
        route: employeeRoute,
    }
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