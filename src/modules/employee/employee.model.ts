import mongoose from "mongoose";
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { IEmployeeDoc, IEmployeeModel } from "./employee.interfaces";

const employeeSchema = new mongoose.Schema<IEmployeeDoc, IEmployeeModel>({
    name: {
        type: String,
        required: true,
        trim: true,
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
            default: 'Company',
        },
    }],

})

employeeSchema.plugin(toJSON);
employeeSchema.plugin(paginate);

employeeSchema.static('isNameTaken', async function (name: string, excludeEmployeeId: mongoose.ObjectId): Promise<boolean> {
    const employee = await this.findOne({ name, _id: { $ne: excludeEmployeeId } });
    return !!employee;
});

const Employee = mongoose.model<IEmployeeDoc, IEmployeeModel>('Employee', employeeSchema)

export default Employee