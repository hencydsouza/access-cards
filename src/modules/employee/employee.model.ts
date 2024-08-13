import mongoose from "mongoose";
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { IEmployeeDoc, IEmployeeModel } from "./employee.interfaces";
import validator from "validator";
import bcrypt from 'bcryptjs'

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
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        validate(value: string) {
            if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
                throw new Error('Password must contain at least one letter and one number');
            }
        },
        private: true,
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

employeeSchema.method('isPasswordMatch', async function (password: string): Promise<boolean> {
    const employee = this;
    return bcrypt.compare(password, employee.password);
});

employeeSchema.pre('save', async function (next) {
    const employee = this;
    if (employee.isModified('password')) {
        employee.password = await bcrypt.hash(employee.password, 8);
    }
    next();
});


const Employee = mongoose.model<IEmployeeDoc, IEmployeeModel>('Employee', employeeSchema)

export default Employee