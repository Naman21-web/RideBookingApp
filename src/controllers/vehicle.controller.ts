import { Request,Response } from "express";
import * as vehicleService from "../services/vehicle.service" 
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { STATUS_CODES } from "../utils/constants";

export const addVehicle = asyncHandler(async (req:Request,res:Response) => {
    const userId = req.user.userId;
    const vehicle = await vehicleService.addVehicle(userId,req.body);

    return successResponse(res,vehicle,"Vehicle added successfully",STATUS_CODES.CREATED);
})