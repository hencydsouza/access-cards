import httpStatus from "http-status";
import mongoose, { Document } from "mongoose";
import Config from "./config.model";
import { ApiError } from "../errors";
import { IOptions, QueryResult } from '../paginate/paginate';
import { IConfigDoc, NewCreatedConfig, UpdateConfigBody } from "./config.interfaces";
import reConfigureAccessLogs  from "../utils/reConfigureAccessLogs";

export const createConfig = async (configBody: NewCreatedConfig): Promise<IConfigDoc> => {
    if (await Config.findOne({ key: configBody.key })) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Config already exists');
    }

    return Config.create(configBody);
};

export const queryConfigs = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult<Document<IConfigDoc>>> => {
    const configs = await Config.paginate(filter, options);
    return configs;
};

export const getConfigById = async (configId: mongoose.Types.ObjectId): Promise<IConfigDoc | null> => Config.findById(new mongoose.Types.ObjectId(configId));

export const updateConfigById = async (
    configId: mongoose.Types.ObjectId,
    updateBody: UpdateConfigBody
): Promise<IConfigDoc | null> => {
    const config = await getConfigById(configId);
    if (!config) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Config not found');
    }

    // check if key is already taken
    if (updateBody.key && (await Config.isKeyTaken(updateBody.key, configId))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Key already taken');
    }

    if (config.key == 'accessLogInterval' && updateBody.value) {
        reConfigureAccessLogs(updateBody.value || 21600)
    }

    Object.assign(config, updateBody);
    await config.save();
    return config;
}



export const deleteConfigById = async (configId: mongoose.Types.ObjectId): Promise<IConfigDoc | null> => {
    const config = await getConfigById(configId);
    if (!config) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Config not found');
    }

    await config.deleteOne();
    return config;
};