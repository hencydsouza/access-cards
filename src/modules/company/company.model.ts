import mongoose from "mongoose";
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { ICompanyDoc, ICompanyModel } from "./company.interfaces";

const companySchema = new mongoose.Schema<ICompanyDoc, ICompanyModel>({
    name: {
        type: String,
        required: true
    },
    buildings: {
        buildingName: {
            type: String,
            required: true
        },
        buildingId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Building'
        }
    },
    // buildingsOwned: [
    //     {
    //         buildingName: {
    //             type: String,
    //         },
    //         buildingId: {
    //             type: mongoose.Types.ObjectId,
    //             ref: 'Building',
    //         }
    //     }
    // ]
})

companySchema.plugin(toJSON);
companySchema.plugin(paginate);

/**
 * Check if name is taken
 * @param {string} name - The company's name
 * @param {ObjectId} [excludeCompanyId] - The id of the company to be excluded
 * @returns {Promise<boolean>}
 */
companySchema.static('isNameTaken', async function (name: string, excludeCompanyId: mongoose.ObjectId): Promise<boolean> {
    const company = await this.findOne({ name, _id: { $ne: excludeCompanyId } });
    return !!company;
});

const Company = mongoose.model<ICompanyDoc, ICompanyModel>('Company', companySchema)

export default Company