import mongoose, { Document, Model } from "mongoose";
import { QueryResult } from '../paginate/paginate';

export interface IAccessLevel {
    name: string,
    type: string,
    description: string,
    permissions: {
        resource: string,
        action: string
    }[]
}

export interface IAccessLevelDoc extends IAccessLevel, Document { }

export interface IAccessLevelModel extends Model<IAccessLevelDoc> {
    isNameTaken(name: string, excludeAccessLevelId?: mongoose.Types.ObjectId): Promise<boolean>;
    paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type NewCreatedAccessLevel = IAccessLevel

export type addPermissionInterface = {
    permissions: {
        resource: string,
        action: string
    }[]
}

export type removePermissionInterface = {
    permissions: string[]
}

export type UpdateAccessLevelBody = Partial<NewCreatedAccessLevel>