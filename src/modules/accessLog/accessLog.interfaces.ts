import mongoose, { Document, Model } from "mongoose";
import { QueryResult } from '../paginate/paginate';

export interface IAccessLog {
    cardHolder: {
        accessCardId: mongoose.Types.ObjectId,
        employeeId?: mongoose.Types.ObjectId,
        companyId: mongoose.Types.ObjectId,
        buildingId: mongoose.Types.ObjectId,
    }
    accessType: string
    timestamp?: Date
}

export interface IAccessLogDoc extends IAccessLog, Document { }

export interface IAccessLogModel extends Model<IAccessLogDoc> {
    // isNameTaken(name: string, excludeAccessLogId?: mongoose.Types.ObjectId): Promise<boolean>;
    paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type NewCreatedAccessLog = IAccessLog

export type UpdateAccessLogBody = Partial<NewCreatedAccessLog>