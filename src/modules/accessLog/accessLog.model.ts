import mongoose from "mongoose";
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { IAccessLogDoc, IAccessLogModel } from "./accessLog.interfaces";

const accessLogSchema = new mongoose.Schema<IAccessLogDoc, IAccessLogModel>({
    bucketStartTime: {
        type: Date,
        required: true,
        index: true
    },
    bucketEndTime: {
        type: Date,
        required: true,
        index: true
    },
    logs: [{
        accessCardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AccessCard',
            required: true,
        },
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: true,
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
            index: true
        },
        buildingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Building',
            required: true,
            index: true
        },
        accessType: {
            type: String,
            enum: ['login', 'logout', 'access'],
            required: true,
        },
        timestamp: {
            type: Date,
            required: true,
        },
    }]
}, { timestamps: true })

accessLogSchema.plugin(toJSON);
accessLogSchema.plugin(paginate);

const AccessLog = mongoose.model<IAccessLogDoc, IAccessLogModel>('AccessLog', accessLogSchema)

export default AccessLog