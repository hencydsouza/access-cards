import mongoose from "mongoose";
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { IAccessLogDoc, IAccessLogModel } from "./accessLog.interfaces";

const accessLogSchema = new mongoose.Schema<IAccessLogDoc, IAccessLogModel>({
    cardHolder: {
        accessCardId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'AccessCard'
        },
        employeeId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Employee'
        },
        companyId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Company'
        },
        buildingId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Building'
        },
    },
    accessType: {
        type: String,
        required: true,
        enum: ['login', 'logout', 'access']
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

accessLogSchema.plugin(toJSON);
accessLogSchema.plugin(paginate);

const AccessLog = mongoose.model<IAccessLogDoc, IAccessLogModel>('AccessLog', accessLogSchema)

export default AccessLog