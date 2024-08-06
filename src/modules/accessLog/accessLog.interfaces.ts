import mongoose, { Document, Model } from "mongoose";
import { QueryResult } from '../paginate/paginate';

// const accessLogSchema = new mongoose.Schema({
//     bucketDate: {
//         type: Date,
//         required: true,
//     },
//     buildingId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Building',
//         required: true,
//         index: true
//     },
//     companyId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Company',
//         required: true,
//         index: true
//     },
//     logs: [{
//         accessCardId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'AccessCard',
//             required: true,
//         },
//         employeeId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Employee',
//             required: true,
//         },
//         accessType: {
//             type: String,
//             enum: ['login', 'logout', 'access'],
//             required: true,
//         },
//         timestamp: {
//             type: Date,
//             required: true,
//         },
//     }]
// }, { timestamps: true })


export interface IAccessLog {
    bucketDate: Date;
    companyId: mongoose.Types.ObjectId;
    logs: {
        accessCardId: mongoose.Types.ObjectId;
        employeeId: mongoose.Types.ObjectId;
        buildingId: mongoose.Types.ObjectId;
        accessType: string;
        timestamp: Date;
    }
}

export interface IAccessLogDoc extends IAccessLog, Document { }

export interface IAccessLogModel extends Model<IAccessLogDoc> {
    // isNameTaken(name: string, excludeAccessLogId?: mongoose.Types.ObjectId): Promise<boolean>;
    paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type NewCreatedAccessLog = {
    accessCardId: mongoose.Types.ObjectId;
    buildingId: mongoose.Types.ObjectId;
    companyId: mongoose.Types.ObjectId;
    accessType: string;
    timestamp: Date;
}

export type UpdateAccessLogBody = Partial<NewCreatedAccessLog>