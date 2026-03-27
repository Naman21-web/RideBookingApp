import { PRICING, STATUS_CODES } from "../utils/constants";
import { calculateDistance } from "../utils/distance";
import * as vehicleRepo from '../repositories/vehicle.repository';
import * as rideRepo from '../repositories/ride.repository';
import { AppError } from "../utils/AppError";

export const estimateFare = async (
  pickupLat: number,
  pickupLng: number,
  dropLat: number,
  dropLng: number
) => {
  const distance = calculateDistance(
    pickupLat,
    pickupLng,
    dropLat,
    dropLng
  );

  const fares: any = {};

  for (const [type, config] of Object.entries(PRICING)) {
    const price = config.baseFare + distance * config.perKm;

    fares[type] = {
      estimatedPrice: Math.round(price),
      distance: Number(distance.toFixed(2)),
      eta: `${Math.ceil(distance * 2)} mins`, // simple logic
    };
  }

  return fares;
};

export const createRide = async (
  userId: string,
  data: any
) => {
  const { pickupLat, pickupLng, dropLat, dropLng, vehicleType } = data;

  // 1. Get nearby drivers (ONLY available ones)
  const driverIds:(string | null)[] = await vehicleRepo.getNearbyDriverIdsRepo(
      pickupLat,
      pickupLng,
      5
    );
    console.log("DriverIds: ",driverIds)    

  if (!driverIds.length) {
    throw new AppError('No drivers available nearby', STATUS_CODES.NOT_FOUND);
  }

  // 2. Fetch vehicles for these drivers
  const vehicles =  await vehicleRepo.getVehiclesByUserIdsRepo(driverIds,vehicleType);

      console.log("Vehicles: ",vehicles)    


  if (!vehicles.length) {
    throw new AppError('No matching vehicles found', STATUS_CODES.NOT_FOUND);
  }

  // 3. Try locking driver (IMPORTANT)
  let selectedDriverId: string | null = null;
  let selectedVehicle: any = null;

  for (const vehicle of vehicles) {
    const lock = await vehicleRepo.goBusyRepo(vehicle.user.id);

    
    console.log("Lock Repo: ",lock);

    if (lock) {
        console.log("Busy Repo: ",vehicle);
      selectedDriverId = vehicle.user.id;
      selectedVehicle = vehicle;

      console.log("Selected Vehicle: ",selectedVehicle,selectedDriverId);
      // remove from available geo set
      const available =  await vehicleRepo.goAvailableRepo(vehicle.user.id);

      break;
    }
  }

console.log("Selected Vehicle: ",selectedVehicle,selectedDriverId);

  if (!selectedDriverId) {
    throw new AppError('Drivers are busy, try again', STATUS_CODES.CONFLICT);
  }

    const driverId =  selectedDriverId;
    const vehicleId = selectedVehicle.id;

    const distance = calculateDistance(data.pickupLat,data.pickupLng,data.dropLat,data.dropLng);

    const fare = PRICING[data.vehicleType].baseFare +
    distance * PRICING[data.vehicleType].perKm;

    const { vehicleType:type, ...rideData } = data;
  // 4. Create Ride in DB
  const ride = await rideRepo.createRideRepo({...rideData,status:'REQUESTED',fare,distance,userId,driverId,vehicleId});

  await vehicleRepo.goActiveRepo(selectedDriverId);

  return ride;
};

export const cancelRide = async (
  rideId: string,
  userId: string
) => {
  const ride = await rideRepo.getRideByIdRepo(rideId);

  if (!ride) {
    throw new AppError('Ride not found', STATUS_CODES.NOT_FOUND);
  }

  // Optional: ensure only owner can cancel
  if (ride.userId !== userId) {
    throw new AppError('Unauthorized', STATUS_CODES.FORBIDDEN);
  }

  // Check cancellable state
  if (!['REQUESTED', 'ACCEPTED'].includes(ride.status)) {
    throw new AppError(
      `Cannot cancel ride in ${ride.status} state`,
      STATUS_CODES.BAD_REQUEST
    );
  }

  // 1. Update DB
  const updatedRide = await rideRepo.cancelRideRepo(rideId);

  // 2. Handle Redis 

  const driverId = ride.driverId;

  if (driverId) {
    vehicleRepo.goInactiveRepo(driverId);

    // add driver back to geo set
    await vehicleRepo.changeVehcileLocationRepo(
      Number(ride.pickupLng),
      Number(ride.pickupLat),
      driverId
    );
  }

  return updatedRide;
};

export const completeRide = async (
  rideId: string,
  driverId: string
) => {
  const ride = await rideRepo.getRideByIdRepo(rideId);

  if (!ride) {
    throw new AppError('Ride not found', STATUS_CODES.NOT_FOUND);
  }

  // 🔒 Ensure correct driver
  if (ride.driverId !== driverId) {
    throw new AppError('Unauthorized', STATUS_CODES.FORBIDDEN);
  }

  // 🚫 Only ongoing rides can be completed
  if (ride.status !== 'ONGOING') {
    throw new AppError(
      `Cannot complete ride in ${ride.status} state`,
      STATUS_CODES.NOT_FOUND
    );
  }

  // 1. Update DB
  const updatedRide = await rideRepo.completeRideRepo(rideId);

  // 2. Handle Redis (VERY IMPORTANT)

  // remove active ride flag
  vehicleRepo.goInactiveRepo(driverId);

  // ✅ Add driver back to geo set (available again)
  await vehicleRepo.changeVehcileLocationRepo(
    Number(ride.dropLng),
    Number(ride.dropLat),
    driverId
  );

  return updatedRide;
};

export const acceptRide = async (
  rideId: string,
  driverId: string
) => {
  const ride = await rideRepo.getRideByIdRepo(rideId);

  if (!ride) {
    throw new AppError('Ride not found', 404);
  }

  // 🔒 Only assigned driver can accept
  if (ride.driverId !== driverId) {
    throw new AppError('Unauthorized', 403);
  }

  if (ride.status !== 'REQUESTED') {
    throw new AppError(
      `Cannot accept ride in ${ride.status}`,
      400
    );
  }

  // Update DB
  const updatedRide = await rideRepo.updateRideStatusRepo(
    rideId,
    'ACCEPTED'
  );

  return updatedRide;
};