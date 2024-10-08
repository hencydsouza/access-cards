import httpStatus from "http-status";
import mongoose, { Document } from "mongoose";
import AccessCard from "./accessCard.model";
import { ApiError } from "../errors";
import { IOptions, QueryResult } from '../paginate/paginate';
import { IAccessCardDoc, NewCreatedAccessCard, UpdateAccessCardBody } from "./accessCard.interfaces";
import { Employee } from "../employee";
import { Company } from "../company";
import { IEmployeeDoc } from "../employee/employee.interfaces";

export const createAccessCard = async (accessCardBody: NewCreatedAccessCard, scope: string, client: IEmployeeDoc): Promise<IAccessCardDoc> => {
    if (accessCardBody.cardNumber && await AccessCard.findOne({ cardNumber: accessCardBody.cardNumber })) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'AccessCard already exists');
    }

    // Check if employee exists and doesn't have an access card
    const [employee, employeeAccessCard] = await Promise.all([
        Employee.findById(accessCardBody.cardHolder.employeeId),
        AccessCard.findOne({ 'cardHolder.employeeId': accessCardBody.cardHolder.employeeId })
    ]);

    if (!employee) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Employee not found');
    }

    if (employeeAccessCard) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Employee already has an access card');
    }

    const accessCardObject = {
        cardNumber: accessCardBody.cardNumber ? accessCardBody.cardNumber : (await Company.findById(employee.company.companyId))?.name.toUpperCase() + '-' + employee.name.split(' ')[0]?.toUpperCase(),
        cardHolder: {
            employeeId: accessCardBody.cardHolder.employeeId,
            companyId: employee.company.companyId,
            buildingId: employee.company.buildingId
        },
        issued_at: accessCardBody.issued_at || new Date(),
        valid_until: accessCardBody.valid_until || null,
        is_active: accessCardBody.is_active || true
    }

    if (scope === 'company' && client.company.companyId.toString() !== employee.company.companyId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Cannot create access card for another company');
    }
    if (scope === 'building' && client.company.buildingId.toString() !== employee.company.buildingId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Cannot create access card for another building');
    }

    const accessCard = await AccessCard.create(accessCardObject);

    // add access card reference in employee document
    employee.accessCardId = accessCard._id;
    await employee.save();

    return accessCard;
};

export const queryAccessCards = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult<Document<IAccessCardDoc>>> => {
    const accessCard = await AccessCard.paginate(filter, options);
    return accessCard;
};

export const getAccessCardById = async (accessCardId: mongoose.Types.ObjectId): Promise<IAccessCardDoc | null> => AccessCard.findById(accessCardId);

export const updateAccessCardById = async (
    accessCardId: mongoose.Types.ObjectId,
    updateBody: UpdateAccessCardBody,
    scope: string,
    client: IEmployeeDoc
): Promise<IAccessCardDoc | null> => {
    const accessCard = await getAccessCardById(accessCardId);
    if (!accessCard) {
        throw new ApiError(httpStatus.NOT_FOUND, 'AccessCard not found');
    }

    if (scope === 'company' && accessCard?.cardHolder.companyId.toString() !== client.company.companyId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'AccessCard not found');
    }
    if (scope === 'building' && accessCard?.cardHolder.buildingId.toString() !== client.company.buildingId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'AccessCard not found');
    }

    // check if card number already exists
    if (updateBody.cardNumber && (await AccessCard.findOne({ cardNumber: updateBody.cardNumber, _id: { $ne: accessCardId } }))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'AccessCard with this card number already exists');
    }

    // Check if employee exists and doesn't have an access card
    if (updateBody.cardHolder && updateBody.cardHolder.employeeId && updateBody.cardHolder.employeeId !== accessCard.cardHolder.employeeId) {
        const [employee, employeeAccessCard] = await Promise.all([
            Employee.findById(updateBody.cardHolder.employeeId),
            AccessCard.findOne({ 'cardHolder.employeeId': updateBody.cardHolder.employeeId })
        ]);

        if (!employee) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Employee not found');
        }

        if (employeeAccessCard) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Employee already has an access card');
        }

        // update access card reference in employee document
        employee.accessCardId = accessCard._id;
        await employee.save();

        // remove access card reference in previous employee document
        const previousEmployee = await Employee.findById(accessCard.cardHolder.employeeId);
        if (previousEmployee) {
            await previousEmployee.updateOne({ $unset: { accessCardId: 1 } });
        }

        // update card holder in access card document
        accessCard.cardHolder.employeeId = updateBody.cardHolder.employeeId;
    }

    Object.assign(accessCard, updateBody);
    await accessCard.save();
    return accessCard;
}

export const deleteAccessCardById = async (accessCardId: mongoose.Types.ObjectId, scope: string, client: IEmployeeDoc): Promise<IAccessCardDoc | null> => {
    const accessCard = await getAccessCardById(accessCardId);
    if (!accessCard) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Access Card not found');
    }

    if (scope === 'company' && accessCard?.cardHolder.companyId.toString() !== client.company.companyId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'AccessCard not found');
    }
    if (scope === 'building' && accessCard?.cardHolder.buildingId.toString() !== client.company.buildingId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'AccessCard not found');
    }

    // remove access card reference in employee document
    const employee = await Employee.findById(accessCard.cardHolder.employeeId);
    if (employee) {
        await employee.updateOne({ $unset: { accessCardId: 1 } });
    }

    await accessCard.deleteOne();
    return accessCard;
};