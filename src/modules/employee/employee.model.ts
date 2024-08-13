import mongoose from "mongoose";
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { IEmployeeDoc, IEmployeeModel } from "./employee.interfaces";
import validator from "validator";

const employeeSchema = new mongoose.Schema<IEmployeeDoc, IEmployeeModel>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value: string) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email');
            }
        },
    },
    company: {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        buildingId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
    },
    accessCardId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
    },
    accessLevels: [{
        accessLevel: {
            type: String,
            required: false,
        },
    }],

}, { timestamps: true })

employeeSchema.plugin(toJSON);
employeeSchema.plugin(paginate);

employeeSchema.static('isNameTaken', async function (name: string, excludeEmployeeId: mongoose.ObjectId): Promise<boolean> {
    const employee = await this.findOne({ name, _id: { $ne: excludeEmployeeId } });
    return !!employee;
});

employeeSchema.static('isEmailTaken', async function (email: string, excludeEmployeeId: mongoose.ObjectId): Promise<boolean> {
    const employee = await this.findOne({ email, _id: { $ne: excludeEmployeeId } });
    return !!employee;
});

const Employee = mongoose.model<IEmployeeDoc, IEmployeeModel>('Employee', employeeSchema)

export default Employee