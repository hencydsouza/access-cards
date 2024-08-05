import mongoose, { Document, Model } from "mongoose";
import { QueryResult } from '../paginate/paginate';

export interface IBuilding {
    name: string,
    address: string,
    ownerCompany: {
        companyName: string,
        companyId: mongoose.Types.ObjectId
    }
}

export interface IBuildingDoc extends IBuilding, Document { }

export interface IBuildingModel extends Model<IBuildingDoc> {
    isNameTaken(name: string, excludeBuildingId?: mongoose.Types.ObjectId): Promise<boolean>;
    paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type NewCreatedBuilding = {
    name: string,
    address: string,
    ownerCompanyName: string
}

export type UpdateBuildingBody = Partial<NewCreatedBuilding>