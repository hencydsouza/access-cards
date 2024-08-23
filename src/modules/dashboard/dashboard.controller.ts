import { Request, Response } from "express";
import { catchAsync } from "../utils";
import { getDashboardData } from "./dashboard.service";

export const dashboard = catchAsync(async (req: Request, res: Response) => {
    // if (req.scope == 'company' || req.scope == 'building') {
    //     throw new ApiError(httpStatus.FORBIDDEN, 'Cannot get buildings')
    // }
    console.log(req.body)
    const result = await getDashboardData()
    res.json(result);
});