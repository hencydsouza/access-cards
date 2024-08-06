import mongoose from "mongoose";
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { IAccessCardDoc, IAccessCardModel } from "./accessCard.interfaces";

const accessCardSchema = new mongoose.Schema<IAccessCardDoc, IAccessCardModel>({
    cardNumber: {
        type: String,
        required: true,
        unique: true
    },
    cardHolder: {
        employeeId: {
            type: mongoose.Types.ObjectId,
            ref: 'Employee',
            required: true
        }
    },
    issued_at: {
        type: Date,
        required: true
    },
    valid_until: {
        type: Date,
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

accessCardSchema.plugin(toJSON);
accessCardSchema.plugin(paginate);

accessCardSchema.static('isCardNumberTaken', async function (cardNumber: string, excludeAccessCardId: mongoose.ObjectId): Promise<boolean> {
    const accessCard = await this.findOne({ cardNumber, _id: { $ne: excludeAccessCardId } });
    return !!accessCard;
});

const AccessCard = mongoose.model<IAccessCardDoc, IAccessCardModel>('AccessCard', accessCardSchema)

export default AccessCard