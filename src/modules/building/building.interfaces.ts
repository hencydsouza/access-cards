import mongoose, { Document, Model } from "mongoose";
import { QueryResult } from '../paginate/paginate';

export interface IBuilding {
    name: string,
    address: string,
    // ownerCompany?: mongoose.Types.ObjectId
}

export interface IBuildingDetails {
    name: string,
    address: string,
    company: {
        name: string
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
    // ownerCompanyName?: string,
    // ownerCompany?: mongoose.Types.ObjectId
}

export type UpdateBuildingBody = Partial<NewCreatedBuilding>

// Response Types
export type AllBuildingsResponse = {
    results: IBuildingDoc[],
    page: number,
    limit: number,
    totalPages: number,
    totalResults: number,
}