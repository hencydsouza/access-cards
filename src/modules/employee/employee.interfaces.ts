import mongoose, { Document, Model } from "mongoose";
import { QueryResult } from '../paginate/paginate';

export interface IEmployee {
    name: string,
    company: {
        companyId: mongoose.Types.ObjectId,
        buildingId: mongoose.Types.ObjectId
    },
    accessCardId: mongoose.Types.ObjectId,
    accessLevels: {
        accessLevel: string
    }[]
}

export interface IEmployeeDoc extends IEmployee, Document { }

export interface IEmployeeModel extends Model<IEmployeeDoc> {
    isNameTaken(name: string, excludeEmployeeId?: mongoose.Types.ObjectId): Promise<boolean>;
    paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type NewCreatedEmployee = {
    name: string,
    companyName: string,
    buildingName: string,
    company?: {
        companyId: mongoose.Types.ObjectId,
        buildingId: mongoose.Types.ObjectId
    },
    accessCardId?: mongoose.Types.ObjectId,
    accessLevels: {
        accessLevel: string
    }[]
}

export type UpdateEmployeeBody = Partial<NewCreatedEmployee>