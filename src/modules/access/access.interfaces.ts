import mongoose from "mongoose";

export interface IAccess {
    accessCardId: mongoose.Types.ObjectId,
    companyId: mongoose.Types.ObjectId,
    buildingId: mongoose.Types.ObjectId,
    accessType: string,
    resource?: string[],
}