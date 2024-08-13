import mongoose, { Document, Model } from "mongoose";
import { QueryResult } from '../paginate/paginate';
import { AccessAndRefreshTokens } from "../employee_token/token.interfaces";

export interface IEmployee {
    name: string,
    email: string,
    password: string
    company: {
        companyId: mongoose.Types.ObjectId,
        buildingId: mongoose.Types.ObjectId
    },
    accessCardId: mongoose.Types.ObjectId,
    accessLevels: {
        accessLevel: string
    }[]
}

export interface IEmployeeDoc extends IEmployee, Document {
    isPasswordMatch(password: string): Promise<boolean>;
    permissions?: { resource: string, action: string, type: string }[]
}

export interface IEmployeeModel extends Model<IEmployeeDoc> {
    isNameTaken(name: string, excludeEmployeeId?: mongoose.Types.ObjectId): Promise<boolean>;
    isEmailTaken(email: string, excludeEmployeeId?: mongoose.Types.ObjectId): Promise<boolean>;
    paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type NewCreatedEmployee = {
    name: string,
    email: string,
    password?: string
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

export interface IEmployeeWithTokens {
    employee: IEmployeeDoc;
    tokens: AccessAndRefreshTokens;
}