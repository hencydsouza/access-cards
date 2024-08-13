import httpStatus from "http-status";
import { IEmployeeDoc } from "../employee/employee.interfaces";
import { ApiError } from "../errors";
import { Request, Response, NextFunction } from "express";
import passport from 'passport';
// import Employee from "../employee/employee.model";
// import mongoose from "mongoose";


const verifyCallback = (req: Request, resolve: any, reject: any, requiredPermissions: string[]) => async (err: Error, employee: IEmployeeDoc, info: string) => {
    if (err || info || !employee) {
        return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    // const permissions = await Employee.aggregate([
    //     {
    //         '$match': {
    //             '_id': new mongoose.Types.ObjectId(employee._id)
    //         }
    //     }, {
    //         '$lookup': {
    //             'from': 'accesslevels',
    //             'localField': 'accessLevels.accessLevel',
    //             'foreignField': 'name',
    //             'pipeline': [
    //                 {
    //                     '$project': {
    //                         'permissions': 1
    //                     }
    //                 }, {
    //                     '$unwind': '$permissions'
    //                 }, {
    //                     '$project': {
    //                         '_id': '$permissions._id',
    //                         'resource': '$permissions.resource',
    //                         'action': '$permissions.action'
    //                     }
    //                 }
    //             ],
    //             'as': 'permissions'
    //         }
    //     }, {
    //         '$project': {
    //             '_id': 0,
    //             'permissions': 1
    //         }
    //     }
    // ])

    // employee.permissions = permissions[0].permissions
    req.employee = employee;

    // console.log(requiredPermissions)
    // console.log(employee)
    // console.log(employee.permissions)

    if (requiredPermissions.length) {
        if (!employee.permissions) return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'))

        const hasRequiredPermissions = requiredPermissions.every((reqPermission: string) =>
            employee.permissions?.some((permission: { resource: string; action: string }) =>
                // permission.resource === reqPermission && permission.action === 'access'
                permission.resource === reqPermission
            )
        );

        if (!hasRequiredPermissions) {
            return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
        }
    }

    resolve();
};

const authMiddleware = (...requiredPermissions: string[]) =>
    async (req: Request, res: Response, next: NextFunction) =>
        new Promise<void>((resolve, reject) => {
            passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredPermissions))(req, res, next);
        })
            .then(() => next())
            .catch((err) => next(err));

export default authMiddleware;
