import { successResponse } from "../utils/apiResponse";
import * as rideService from '../services/ride.service';
import { asyncHandler } from "../utils/asyncHandler";
import { STATUS_CODES } from "../utils/constants";

export const estimateFare = asyncHandler(async (req:Request, res:Response) => {
  const { pickupLat, pickupLng, dropLat, dropLng } = req.query;

  const fares = await rideService.estimateFare(
    pickupLat,
    pickupLng,
    dropLat,
    dropLng
  );

  return successResponse(res, fares, 'Fare estimated');
});

export const createRide = asyncHandler(async (req: any, res) => {
  const userId = req.user.userId;

  const ride = await rideService.createRide(userId, req.body);

  return successResponse(res, ride, 'Ride created successfully',STATUS_CODES.CREATED);
});

export const cancelRide = asyncHandler(async (req: Request, res:Response) => {
  const { rideId } = req.params;
  const userId = req.user.userId;

  const ride = await rideService.cancelRide(rideId, userId);

  return successResponse(res, ride, 'Ride cancelled successfully');
});

export const completeRide = asyncHandler(async (req: any, res) => {
  const { rideId } = req.params;
  const driverId = req.user.userId; // driver logged in

  const ride = await rideService.completeRide(rideId, driverId);

  return successResponse(res, ride, 'Ride completed successfully');
});

export const acceptRide = asyncHandler(async (req: any, res) => {
  const { rideId } = req.params;
  const driverId = req.user.userId;

  const ride = await rideService.acceptRide(rideId, driverId);

  return successResponse(res, ride, 'Ride accepted');
});

export const rejectRide = asyncHandler(async (req: any, res) => {
  const { rideId } = req.params;
  const driverId = req.user.userId;

  const ride = await rideService.rejectRide(rideId, driverId);

  return successResponse(res, ride, 'Ride rejected');
});

export const startRide = asyncHandler(async (req: any, res) => {
  const { rideId } = req.params;
  const driverId = req.user.userId;

  const ride = await rideService.startRide(rideId, driverId);

  return successResponse(res, ride, 'Ride started successfully');
});