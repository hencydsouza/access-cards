import mongoose, { Document, Model } from "mongoose";
import { QueryResult } from '../paginate/paginate';

export interface ICompany {
    name: string,
    buildings: {
        buildingId: mongoose.Types.ObjectId,
        buildingName: string
    },
    ownedBuildings?: {
        buildingId: mongoose.Types.ObjectId
        buildingName: string
    }[]
}

export interface ICompanyDoc extends ICompany, Document { }

export interface ICompanyModel extends Model<ICompanyDoc> {
    isNameTaken(name: string, excludeCompanyId?: mongoose.Types.ObjectId): Promise<boolean>;
    paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type NewCreatedCompany = {
    name: string,
    buildingId: string,
    ownedBuildings?: {
        buildingName?: string,
        buildingId: mongoose.Types.ObjectId
    }[]
}

export type UpdateCompanyBody = Partial<{
    name: string,
    // buildingName: string,
    buildingId: string,
    ownedBuildings?: {
        buildingName?: string
        buildingId?: mongoose.Types.ObjectId
    }[]
}>