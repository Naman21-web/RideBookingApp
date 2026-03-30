import { Request,Response } from "express";
import * as vehicleService from "../services/vehicle.service" 
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { STATUS_CODES } from "../utils/constants";

export const addVehicle = asyncHandler(async (req:Request,res:Response) => {
    const userId = req.user.userId;
    const vehicle = await vehicleService.addVehicle(userId,req.body);

    return successResponse(res,vehicle,"Vehicle added successfully",STATUS_CODES.CREATED);
});

export const updateVehicle = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user.userId;

  const updatedVehicle = await vehicleService.updateVehicle(
    userId,
    req.body
  );

  return successResponse(res, updatedVehicle, 'Vehicle updated successfully',STATUS_CODES.OK);
});

export const getVehicle = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user.userId;

  const vehicle = await vehicleService.getVehicle(userId);

  return successResponse(res, vehicle, 'Vehicle fetched successfully');
});

export const getAllVehicles = asyncHandler(async (req:Request, res:Response) => {
  const vehicles = await vehicleService.getAllVehicles();

  return successResponse(res, vehicles, 'All vehicles fetched');
});

export const updateLocation = asyncHandler(async (req: Request, res:Response) => {
  const userId = req.user.userId;
  const { lat, lng } = req.body;

  await vehicleService.updateVehicleLocation(userId, lat, lng);

  return successResponse(res, null, 'Location updated',STATUS_CODES.NO_CONTENT);
});

export const getNearbyVehicles = asyncHandler(async (req:Request, res:Response) => {
  const { lat, lng, radius = 5,vehicleType } = req.query;

  const vehicles = await vehicleService.getNearbyVehicles(
    Number(lat),
    Number(lng),
    Number(radius),
    vehicleType
  );

  return successResponse(res, vehicles, 'Nearby vehicles fetched');
});

export const goOffline = asyncHandler(async (req:Request, res:Response) => {
    const userId = req.user.userId;
    vehicleService.goOffline(userId);
    return successResponse(res, null, 'Vehicle Status Updated Successfully',STATUS_CODES.NO_CONTENT);
});

export const goOnline = asyncHandler(async (req:Request, res:Response) => {
    const userId = req.user.userId;
    vehicleService.goOnline(userId);
    return successResponse(res, null, 'Vehicle Status Updated Successfully',STATUS_CODES.NO_CONTENT);
});

export const goBusy = asyncHandler(async (req:Request, res:Response) => {
    const userId = req.user.userId;
    vehicleService.goBusy(userId);
    return successResponse(res, null, 'Vehicle Status Updated Successfully',STATUS_CODES.NO_CONTENT);
});

export const goAvailable = asyncHandler(async (req:Request, res:Response) => {
    const userId = req.user.userId;
    vehicleService.goAvailable(userId);
    return successResponse(res, null, 'Vehicle Status Updated Successfully',STATUS_CODES.NO_CONTENT);
});