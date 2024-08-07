import mongoose from "mongoose";
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { IConfigDoc, IConfigModel } from "./config.interfaces";

const configSchema = new mongoose.Schema<IConfigDoc, IConfigModel>({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: Number,
        required: true
    }
}, { timestamps: true })

configSchema.plugin(toJSON);
configSchema.plugin(paginate);

configSchema.static('isKeyTaken', async function (key: string, excludeConfigId: mongoose.ObjectId): Promise<boolean> {
    const config = await this.findOne({ key, _id: { $ne: excludeConfigId } });
    return !!config;
});

const Config = mongoose.model<IConfigDoc, IConfigModel>('Config', configSchema)

export default Config