import httpStatus from "http-status";
import mongoose from "mongoose";
import AccessLog from "./accessLog.model";
import { ApiError } from "../errors";
import { IOptions, QueryResult } from '../paginate/paginate';
import { IAccessLogDoc, NewCreatedAccessLog } from "./accessLog.interfaces";
import { AccessCard } from "../accessCard";
import { Company } from "../company";
import { Building } from "../building";
import { Config } from "../config";

export const createAccessLog = async (accessLogBody: NewCreatedAccessLog): Promise<IAccessLogDoc | null> => {
    // implement validation
    const [accessCard, company, building] = await Promise.all([
        AccessCard.findById(accessLogBody.accessCardId),
        Company.findById(accessLogBody.companyId),
        Building.findById(accessLogBody.buildingId)
    ]);

    if (!accessCard) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid access card');
    }
    if (!company) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid company');
    }
    if (!building) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid building');
    }

    // get last bucket
    // const lastBucket = await AccessLog.findOne({}, {}, { sort: { updatedAt: -1 } })
    // logger.info(lastBucket)

    let logTime = accessLogBody.timestamp || Date.now()

    // check if the logTime falls within the lastAccessLog


    // const logBucket = await AccessLog.findOne({ bucketDate: logTime.toISOString().split('T')[0] + 'T00:00:00.000Z' })
    const lastAccessLog = await AccessLog.findOne({}, {}, { sort: { updatedAt: -1 } })

    if (lastAccessLog?.bucketEndTime && lastAccessLog.bucketEndTime > logTime) {
        const log = {
            accessCardId: accessLogBody.accessCardId,
            employeeId: accessCard.cardHolder.employeeId,
            companyId: accessLogBody.companyId,
            buildingId: accessLogBody.buildingId,
            accessType: accessLogBody.accessType,
            timestamp: accessLogBody.timestamp || logTime
        }
        await lastAccessLog.updateOne({ $push: { logs: log } })
        return AccessLog.findById(lastAccessLog._id)
    } else {
        // get interval from config or default to next 6 hours
        const interval = await Config.findOne({ key: 'accessLogInterval' })
        const intervalInSeconds = interval?.value || 21600

        const newLogBucket = await AccessLog.create({
            bucketStartTime: logTime,
            bucketEndTime: new Date(new Date(logTime).getTime() + intervalInSeconds * 1000),
            logs: [{
                accessCardId: accessLogBody.accessCardId,
                employeeId: accessCard.cardHolder.employeeId,
                companyId: accessLogBody.companyId,
                buildingId: accessLogBody.buildingId,
                accessType: accessLogBody.accessType,
                timestamp: accessLogBody.timestamp || Date.now()
            }]
        })

        return newLogBucket
    }
};

export const queryAccessLogs = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
    const accessLogs = await AccessLog.paginate(filter, options);
    return accessLogs;
};

export const getAccessLogById = async (accessLogId: mongoose.Types.ObjectId): Promise<IAccessLogDoc | null> => AccessLog.aggregate([
    { $match: { 'logs._id': accessLogId } },
    { $unwind: '$logs' },
    { $match: { 'logs._id': accessLogId } },
    {
        $project: {
            _id: 1,
            bucketDate: 1,
            companyId: 1,
            'logs._id': 1,
            'logs.buildingId': 1,
            'logs.accessType': 1,
            'logs.accessCardId': 1,
            'logs.employeeId': 1,
            'logs.timestamp': 1,
        }
    }
]).then(results => results[0] || null);

// export const updateAccessLogById = async (
//     accessLogId: mongoose.Types.ObjectId,
//     updateBody: UpdateAccessLogBody
// ): Promise<IAccessLogDoc | null> => {
//     const accessLog = await getAccessLogById(accessLogId);
//     if (!accessLog) {
//         throw new ApiError(httpStatus.NOT_FOUND, 'AccessLog not found');
//     }

//     // TODO: Implement validation
//     if (updateBody.cardHolder) {
//         let accessCard, company, building;

//         if (updateBody.cardHolder?.accessCardId) {
//             accessCard = await AccessCard.findById(updateBody.cardHolder.accessCardId);
//             if (!accessCard) {
//                 throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid access card');
//             }
//             updateBody.cardHolder.employeeId = accessCard.cardHolder.employeeId
//         }

//         if (updateBody.cardHolder?.companyId) {
//             company = await Company.findById(updateBody.cardHolder.companyId);
//             if (!company) {
//                 throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid company');
//             }
//         }

//         if (updateBody.cardHolder?.buildingId) {
//             building = await Building.findById(updateBody.cardHolder.buildingId);
//             if (!building) {
//                 throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid building');
//             }
//         }
//     }

//     Object.assign(accessLog, updateBody);
//     await accessLog.save();
//     return accessLog;
// }

export const deleteAccessLogById = async (accessLogId: mongoose.Types.ObjectId): Promise<IAccessLogDoc | null> => {
    const accessLog = await AccessLog.findOneAndUpdate(
        { 'logs._id': accessLogId },
        { $pull: { logs: { _id: accessLogId } } },
        { new: true }
    );

    if (!accessLog) {
        throw new ApiError(httpStatus.NOT_FOUND, 'AccessLog not found');
    }

    return accessLog;
};