import { successResponse } from "../utils/apiResponse";
import * as rideService from '../services/ride.service';
import { asyncHandler } from "../utils/asyncHandler";

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