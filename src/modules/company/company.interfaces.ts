import mongoose, { Document, Model } from "mongoose";
import { QueryResult } from '../paginate/paginate';

export interface ICompany {
    name: string,
    buildings: {
        buildingId: mongoose.Types.ObjectId,
        buildingName: string
    },
    // buildingsOwned?: { buildingId: mongoose.Types.ObjectId }[]
}

export interface ICompanyDoc extends ICompany, Document { }

export interface ICompanyModel extends Model<ICompanyDoc> {
    isNameTaken(name: string, excludeCompanyId?: mongoose.Types.ObjectId): Promise<boolean>;
    paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type NewCreatedCompany = {
    name: string,
    buildingName: string,
    // buildingsOwned?: { buildingName: string }[]
}

export type UpdateCompanyBody = Partial<{
    name: string,
    buildingName: string,
    buildingsOwned?: { buildingName: string }[]
}>