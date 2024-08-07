import mongoose, { Document, Model } from "mongoose";
import { QueryResult } from '../paginate/paginate';

export interface IConfig {
    key: string,
    value: number,
}

export interface IConfigDoc extends IConfig, Document { }

export interface IConfigModel extends Model<IConfigDoc> {
    isKeyTaken(key: string, excludeConfigId?: mongoose.Types.ObjectId): Promise<boolean>;
    paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type NewCreatedConfig = IConfig

export type UpdateConfigBody = Partial<NewCreatedConfig>