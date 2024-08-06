import httpStatus from "http-status";
import mongoose from "mongoose";
import AccessLog from "./accessLog.model";
import { ApiError } from "../errors";
import { IOptions, QueryResult } from '../paginate/paginate';
import { IAccessLogDoc, NewCreatedAccessLog, UpdateAccessLogBody } from "./accessLog.interfaces";
import { AccessCard } from "../accessCard";
import { Company } from "../company";
import { Building } from "../building";

export const createAccessLog = async (accessLogBody: NewCreatedAccessLog): Promise<IAccessLogDoc> => {
    // TODO: implement duplicate check
    // if (await AccessLog.findOne({ name: accessLogBody.name })) {
    //     throw new ApiError(httpStatus.BAD_REQUEST, 'AccessLog already exists');
    // }

    // TODO: implement validation

    // implement validation
    const [accessCard, company, building] = await Promise.all([
        AccessCard.findById(accessLogBody.cardHolder.accessCardId),
        Company.findById(accessLogBody.cardHolder.companyId),
        Building.findById(accessLogBody.cardHolder.buildingId)
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

    accessLogBody.cardHolder.employeeId = accessCard.cardHolder.employeeId;

    return AccessLog.create(accessLogBody);
};

export const queryAccessLogs = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
    const accessLogs = await AccessLog.paginate(filter, options);
    return accessLogs;
};

export const getAccessLogById = async (accessLogId: mongoose.Types.ObjectId): Promise<IAccessLogDoc | null> => AccessLog.findById(accessLogId);

export const updateAccessLogById = async (
    accessLogId: mongoose.Types.ObjectId,
    updateBody: UpdateAccessLogBody
): Promise<IAccessLogDoc | null> => {
    const accessLog = await getAccessLogById(accessLogId);
    if (!accessLog) {
        throw new ApiError(httpStatus.NOT_FOUND, 'AccessLog not found');
    }

    // TODO: Implement validation
    if (updateBody.cardHolder) {
        let accessCard, company, building;

        if (updateBody.cardHolder?.accessCardId) {
            accessCard = await AccessCard.findById(updateBody.cardHolder.accessCardId);
            if (!accessCard) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid access card');
            }
            updateBody.cardHolder.employeeId = accessCard.cardHolder.employeeId
        }

        if (updateBody.cardHolder?.companyId) {
            company = await Company.findById(updateBody.cardHolder.companyId);
            if (!company) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid company');
            }
        }

        if (updateBody.cardHolder?.buildingId) {
            building = await Building.findById(updateBody.cardHolder.buildingId);
            if (!building) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid building');
            }
        }
    }

    Object.assign(accessLog, updateBody);
    await accessLog.save();
    return accessLog;
}

export const deleteAccessLogById = async (accessLogId: mongoose.Types.ObjectId): Promise<IAccessLogDoc | null> => {
    const accessLog = await getAccessLogById(accessLogId);
    if (!accessLog) {
        throw new ApiError(httpStatus.NOT_FOUND, 'AccessLog not found');
    }

    await accessLog.deleteOne();
    return accessLog;
};