import httpStatus from "http-status";
import mongoose, { Document } from "mongoose";
import AccessLevel from "./accessLevel.model";
import { ApiError } from "../errors";
import { IOptions, QueryResult } from '../paginate/paginate';
import { addPermissionInterface, IAccessLevelDoc, NewCreatedAccessLevel, removePermissionInterface, UpdateAccessLevelBody } from "./accessLevel.interfaces";
import { Employee } from "../employee";

/**
 * Creates a new access level in the system.
 *
 * @param accessLevelBody - An object containing the details of the new access level to create.
 * @returns A Promise that resolves to the newly created access level document.
 * @throws ApiError with status code 400 if an access level with the same name already exists.
 */
export const createAccessLevel = async (accessLevelBody: NewCreatedAccessLevel): Promise<IAccessLevelDoc> => {
    if (await AccessLevel.findOne({ name: accessLevelBody.name })) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'AccessLevel already exists');
    }

    return AccessLevel.create(accessLevelBody);
};

/**
 * Queries the AccessLevel model and returns a paginated result.
 *
 * @param filter - An object containing the filter criteria for the query.
 * @param options - An object containing the pagination options for the query.
 * @returns A Promise that resolves to a QueryResult object containing the paginated access levels.
 */
export const queryAccessLevels = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult<Document<IAccessLevelDoc>>> => {
    const accessLevels = await AccessLevel.paginate(filter, options);
    return accessLevels;
};

export const getAllAccessLevelNames = async () => {
    const result = await AccessLevel.find().select({ name: 1, _id: 1 })
    return result
}

/**
 * Retrieves an access level document by its unique identifier.
 *
 * @param accessLevelId - The unique identifier of the access level to retrieve.
 * @returns A Promise that resolves to the access level document, or null if not found.
 */
export const getAccessLevelById = async (accessLevelId: mongoose.Types.ObjectId): Promise<IAccessLevelDoc | null> => AccessLevel.findById(accessLevelId, { "permissions._id": 0 });

export const getAccessLevelByName = async (name: string): Promise<IAccessLevelDoc | null> => AccessLevel.findOne({ name });

export const updateAccessLevelById = async (
    accessLevelId: mongoose.Types.ObjectId,
    updateBody: UpdateAccessLevelBody
): Promise<IAccessLevelDoc | null> => {
    const accessLevel = await getAccessLevelById(accessLevelId);
    if (!accessLevel) {
        throw new ApiError(httpStatus.NOT_FOUND, 'AccessLevel not found');
    }

    Object.assign(accessLevel, updateBody);
    await accessLevel.save();
    return accessLevel;
}

export const addPermissionToAccessLevel = async (
    accessLevelId: mongoose.Types.ObjectId,
    permissionsBody: addPermissionInterface
): Promise<IAccessLevelDoc | null> => {
    const accessLevel = await getAccessLevelById(accessLevelId);
    if (!accessLevel) {
        throw new ApiError(httpStatus.NOT_FOUND, 'AccessLevel not found');
    }

    Object.assign(accessLevel.permissions, permissionsBody.permissions);
    await accessLevel.save();
    return accessLevel;
}

export const removePermissionFromAccessLevel = async (
    accessLevelId: mongoose.Types.ObjectId,
    permissionsBody: removePermissionInterface
): Promise<IAccessLevelDoc | null> => {
    const accessLevel = await getAccessLevelById(accessLevelId);
    if (!accessLevel) {
        throw new ApiError(httpStatus.NOT_FOUND, 'AccessLevel not found');
    }

    permissionsBody.permissions.forEach(permission => {
        accessLevel.permissions = accessLevel.permissions.filter(item => item.resource !== permission)
    })

    await accessLevel.save();
    return accessLevel;
}

export const deleteAccessLevelById = async (accessLevelId: mongoose.Types.ObjectId): Promise<IAccessLevelDoc | null> => {
    const accessLevel = await getAccessLevelById(accessLevelId);
    if (!accessLevel) {
        throw new ApiError(httpStatus.NOT_FOUND, 'AccessLevel not found');
    }

    // Check if the access level is being used before deleting
    const employeesWithAccessLevel = await Employee.find({ 'accessLevels': { $elemMatch: { "accessLevel": accessLevel.name } } });
    if (employeesWithAccessLevel.length > 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete, AccessLevel is being used by employees');
    }

    await accessLevel.deleteOne();
    return accessLevel;
};
