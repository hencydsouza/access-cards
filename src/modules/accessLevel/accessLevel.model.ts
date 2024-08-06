import mongoose from "mongoose";
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { IAccessLevelDoc, IAccessLevelModel } from "./accessLevel.interfaces";

const accessLevelSchema = new mongoose.Schema<IAccessLevelDoc, IAccessLevelModel>({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    permissions: {
        type: [{
            resource: {
                type: String,
                required: true
            },
            action: {
                type: String,
                required: true
            }
        }],
        required: true
    }
},{timestamps: true})

accessLevelSchema.plugin(toJSON);
accessLevelSchema.plugin(paginate);

/**
 * Checks if an access level with the given name already exists, excluding the specified access level ID.
 * @param name - The name of the access level to check.
 * @param excludeAccessLevelId - The ID of the access level to exclude from the check.
 * @returns A boolean indicating whether an access level with the given name already exists.
 */
accessLevelSchema.static('isNameTaken', async function (name: string, excludeAccessLevelId: mongoose.ObjectId): Promise<boolean> {
    const accessLevel = await this.findOne({ name, _id: { $ne: excludeAccessLevelId } });
    return !!accessLevel;
});

const AccessLevel = mongoose.model<IAccessLevelDoc, IAccessLevelModel>('AccessLevel', accessLevelSchema)

export default AccessLevel