import mongoose from "mongoose";
import { IAccessLog } from "../accessLog/accessLog.interfaces";

export interface IAccess {
    accessCardId: mongoose.Types.ObjectId,
    companyId: mongoose.Types.ObjectId,
    buildingId: mongoose.Types.ObjectId,
    eventType: string,
    resource?: string[],
}

// Response types

export type AccessResponse = {
    message: string | IAccessLog
}