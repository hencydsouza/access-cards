import mongoose from 'mongoose';
import tokenTypes from './token.types';
import toJSON from '../toJSON/toJSON';
import { ITokenDoc, ITokenModel } from './token.interfaces';

const tokenSchema = new mongoose.Schema<ITokenDoc, ITokenModel>(
    {
        token: {
            type: String,
            required: true,
            index: true,
        },
        employee: {
            type: String,
            ref: 'Employee',
            required: true,
        },
        type: {
            type: String,
            enum: [tokenTypes.REFRESH, tokenTypes.RESET_PASSWORD, tokenTypes.VERIFY_EMAIL],
            required: true,
        },
        expires: {
            type: Date,
            required: true,
        },
        scope: {
            type: String,
            required: true,
        },
        blacklisted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
tokenSchema.plugin(toJSON);

const Token = mongoose.model<ITokenDoc, ITokenModel>('EmployeeToken', tokenSchema);

export default Token;
