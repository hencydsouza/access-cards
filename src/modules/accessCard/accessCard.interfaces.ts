import mongoose, { Document, Model } from "mongoose";
import { QueryResult } from '../paginate/paginate';

export interface IAccessCard {
    cardNumber: string,
    cardHolder: {
        employeeId: mongoose.Types.ObjectId,
    }
    issued_at: Date,
    valid_until: Date,
    is_active: boolean
}

export interface IAccessCardDoc extends IAccessCard, Document { }

export interface IAccessCardModel extends Model<IAccessCardDoc> {
    isCardNumberTaken(cardNumber: string, excludeAccessCardId?: mongoose.Types.ObjectId): Promise<boolean>;
    paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type NewCreatedAccessCard = {
    cardNumber: string,
    cardHolder: {
        employeeId: mongoose.Types.ObjectId,
    }
    issued_at?: Date,
    valid_until?: Date,
    is_active?: boolean
}

export type UpdateAccessCardBody = Partial<NewCreatedAccessCard>