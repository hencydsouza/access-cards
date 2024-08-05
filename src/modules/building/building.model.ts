import mongoose from "mongoose";
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { IBuildingDoc, IBuildingModel } from "./building.interfaces";

const buildingSchema = new mongoose.Schema<IBuildingDoc, IBuildingModel>({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    ownerCompany: {
        type: mongoose.Types.ObjectId,
        required: false
    }
})

buildingSchema.plugin(toJSON);
buildingSchema.plugin(paginate);

/**
 * Check if name is taken
 * @param {string} name - The building's name
 * @param {ObjectId} [excludeBuildingId] - The id of the building to be excluded
 * @returns {Promise<boolean>}
 */
buildingSchema.static('isNameTaken', async function (name: string, excludeBuildingId: mongoose.ObjectId): Promise<boolean> {
    const building = await this.findOne({ name, _id: { $ne: excludeBuildingId } });
    return !!building;
});

const Building = mongoose.model<IBuildingDoc, IBuildingModel>('Building', buildingSchema)

export default Building