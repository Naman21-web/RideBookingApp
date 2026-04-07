import { PRICING, STATUS_CODES } from "../utils/constants";
import { calculateDistance } from "../utils/distance";
import * as vehicleRepo from '../repositories/vehicle.repository';
import * as rideRepo from '../repositories/ride.repository';
import { AppError } from "../utils/AppError";
import { getIO  } from "../config/socket";
import { rideQueue } from "../queues/ride.queue";

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


export const assignNextDriver = async (rideId: string) => {
  const drivers: (string | null)[] = await vehicleRepo.getDriversForRideRepo(rideId);

  if (!drivers) return;

  // let drivers: string[] = JSON.parse(data);

  if (!drivers.length) {
    // throw new AppError('No drivers available', STATUS_CODES.NOT_FOUND);
    console.log('No drivers available for ride', rideId);
    const io = getIO();
    io.to(`ride:${rideId}`).emit('noDrivers', {
      message: 'No drivers available',
    });
    return;
  }

  const driverId: string = drivers.shift(); // get first driver

  // update Redis queue
  await vehicleRepo.setDriversForRideRepo(rideId, drivers);

  // mark driver busy (lock)
  const lock = await vehicleRepo.goBusyRepo(driverId);

  if (!lock) {
    // driver already busy → try next
    return assignNextDriver(rideId);
  }

  

  // notify driver via socket
  const io = getIO();

  io.to(`driver:${driverId}`).emit('newRideRequest', {
    rideId,
  });

  await vehicleRepo.setCurrentTempDriverForRideRepo(rideId, driverId);

  console.log(`Notified driver ${driverId} about ride ${rideId}`);

  // start timeout
  setDriverTimeout(rideId, driverId);
};


// const setDriverTimeout = (rideId: string, driverId: string) => {
//   console.log(`Setting response timeout for driver ${driverId} on ride ${rideId}`);
//   setTimeout(async () => {
//     const currentDriver = await vehicleRepo.getCurrentDriverForRideRepo(rideId);

//     console.log(`Timeout check for ride ${rideId}: current driver is ${currentDriver}, expected ${driverId}`);

//     // if still same driver → no response
//     if (currentDriver !== driverId) {
//       console.log('Driver timeout, reassigning...');

//       // release lock
//       await vehicleRepo.goAvailableRepo(driverId);

//       // assign next driver
//       await assignNextDriver(rideId);
//     }
//   }, DRIVER_RESPONSE_TIMEOUT);
// };

const DRIVER_RESPONSE_TIMEOUT = 60000; // 30 sec

const setDriverTimeout = async (rideId: string, driverId: string) => {
  console.log(`Setting response timeout for driver ${driverId} on ride ${rideId}`);
  await rideQueue.add(
    'driverTimeout',
    {
      rideId,
      driverId,
    },
    {
      delay: DRIVER_RESPONSE_TIMEOUT,
      attempts: 3,  // optional retry
    }
  );
  console.log(`Driver timeout job added to queue for driver ${driverId} on ride ${rideId}`);
};


export const createRide = async (
  userId: string,
  data: any
) => {
  const { pickupLat, pickupLng, dropLat, dropLng, vehicleType } = data;
  
  const distance = calculateDistance(pickupLat,pickupLng,dropLat,dropLng);
  
  const fare = PRICING[vehicleType].baseFare +
  distance * PRICING[vehicleType].perKm;
  
  const { vehicleType:type, ...rideData } = data;
  // 4. Create Ride in DB
  const ride = await rideRepo.createRideRepo({...rideData,status:'REQUESTED',fare,distance,userId});
  
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

  const vehicles =  await vehicleRepo.getVehiclesByUserIdsRepo(driverIds,vehicleType);

  const availableDriverIds = vehicles.map(v => v.user.id);

  console.log("Available DriverIds: ",availableDriverIds);

  await vehicleRepo.setDriversForRideRepo(ride.id, availableDriverIds);



//   // 2. Fetch vehicles for these drivers
//   const vehicles =  await vehicleRepo.getVehiclesByUserIdsRepo(driverIds,vehicleType);

//       console.log("Vehicles: ",vehicles)    


//   if (!vehicles.length) {
//     throw new AppError('No matching vehicles found', STATUS_CODES.NOT_FOUND);
//   }

//   // 3. Try locking driver (IMPORTANT)
//   let selectedDriverId: string | null = null;
//   let selectedVehicle: any = null;

//   for (const vehicle of vehicles) {
//     const lock = await vehicleRepo.goBusyRepo(vehicle.user.id);

    
//     console.log("Lock Repo: ",lock);

//     if (lock) {
//         console.log("Busy Repo: ",vehicle);
//       selectedDriverId = vehicle.user.id;
//       selectedVehicle = vehicle;

//       console.log("Selected Vehicle: ",selectedVehicle,selectedDriverId);
//       // remove from available geo set
//       const available =  await vehicleRepo.goAvailableRepo(vehicle.user.id);

//       break;
//     }
//   }

// console.log("Selected Vehicle: ",selectedVehicle,selectedDriverId);

//   if (!selectedDriverId) {
//     throw new AppError('Drivers are busy, try again', STATUS_CODES.CONFLICT);
//   }

//     const driverId =  selectedDriverId;
//     const vehicleId = selectedVehicle.id;


  // await vehicleRepo.goActiveRepo(selectedDriverId);

  assignNextDriver(ride.id).catch(async (err) => {
    console.error('Driver assignment failed:', err);

    // // optional: update ride status
    // await rideRepo.updateRideStatus(ride.id, 'CANCELLED');

    // // optional: notify user via pub/sub
    // await publishEvent('ride-events', {
    //   type: 'NO_DRIVERS',
    //   rideId: ride.id,
    // });
    // throw new AppError('No drivers available', STATUS_CODES.NOT_FOUND);
    // throw err;
    // throw new AppError('No drivers available', STATUS_CODES.NOT_FOUND);
  });;

  return ride;
};

export const cancelRide = async (
  rideId: string,
  userId: string
) => {
  const ride = await rideRepo.getRideByIdRepo(rideId);

  console.log(`Cancelling ride ${rideId} by user ${userId}`,ride);

  if (!ride) {
    throw new AppError('Ride not found', STATUS_CODES.NOT_FOUND);
  }

  // Optional: ensure only owner can cancel
  if ((ride.userId !== userId && ride.driverId !== userId) || ride.status === 'ONGOING' ) {
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

  console.log(`Ride cancelled: ${rideId}`, updatedRide);

  // notify driver,user via socket
  const io = getIO();

  io.to(`ride:${rideId}`).emit('rideCancelled', {
    rideId,
  });

  // 2. Handle Redis 

  const driverId = ride.driverId;

  if (driverId) {
    vehicleRepo.goInactiveRepo(driverId);

    // add driver back to geo set //Need to comment it later afer testing 
    await vehicleRepo.changeVehcileLocationRepo(
      driverId,
      Number(ride.pickupLng),
      Number(ride.pickupLat)
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

  // Ensure correct driver
  if (ride.driverId !== driverId) {
    throw new AppError('Unauthorized', STATUS_CODES.FORBIDDEN);
  }

  // Only ongoing rides can be completed
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

  // Add driver back to geo set (available again)
  await vehicleRepo.changeVehcileLocationRepo(
    driverId,
    Number(ride.dropLng),
    Number(ride.dropLat)
  );

  const io = getIO();
  io.to(`ride:${rideId}`).emit('rideCompleted', {
    rideId,
  });

  return updatedRide;
};

export const acceptRide = async (
  rideId: string,
  driverId: string
) => {
  const ride = await rideRepo.getRideByIdRepo(rideId);

  console.log(`Accepting ride ${rideId} by driver ${driverId}`);

  if (!ride) {
    throw new AppError('Ride not found', STATUS_CODES.NOT_FOUND);
  }

  const currentDriver = await vehicleRepo.getCurrentTempDriverForRideRepo(rideId);

  console.log(`Accept ride ${rideId} by driver ${driverId}, current assigned driver is ${currentDriver}`);

  // Only assigned driver can accept
  if (currentDriver !== driverId) {
    throw new AppError('Unauthorized', STATUS_CODES.FORBIDDEN);
  }

  if (ride.status !== 'REQUESTED') {
    throw new AppError(
      `Cannot accept ride in ${ride.status}`,
      STATUS_CODES.BAD_REQUEST
    );
  }

  // Update DB
  const updatedRide = await rideRepo.updateRideStatusRepo(
    rideId,
    'ACCEPTED'
  );

  //Get veqhicle details
  const vehicle = await vehicleRepo.getVehicleByUserIdRepo(driverId);

    //Update ride with driver
  await rideRepo.updateRideDriverRepo(rideId, {vehicleId: vehicle.id, driverId});

  await vehicleRepo.goActiveRepo(driverId);

  // store current assigned driver
  await vehicleRepo.setCurrentDriverForRideRepo(rideId, driverId);

  const io = getIO();

  io.to(`ride:${rideId}`).emit('rideAccepted', {
    rideId
  });

  return updatedRide;
};

export const rejectRide = async (
  rideId: string,
  driverId: string
) => {
  const ride = await rideRepo.getRideByIdRepo(rideId);

  if (!ride) {
    throw new AppError('Ride not found', STATUS_CODES.NOT_FOUND);
  }
  
  const currentDriver = await vehicleRepo.getCurrentTempDriverForRideRepo(rideId);

  console.log(`Reject ride ${rideId} by driver ${driverId}, current assigned driver is ${currentDriver}`);

  if (currentDriver !== driverId) {
    throw new AppError('Unauthorized', STATUS_CODES.FORBIDDEN);
  }

  if (ride.status !== 'REQUESTED') {
    throw new AppError(
      `Cannot reject ride in ${ride.status}`,
      STATUS_CODES.BAD_REQUEST
    );
  }

  // 1. Release driver
  vehicleRepo.goInactiveRepo(driverId);

  const isOffline = await vehicleRepo.checkOfflineRepo(driverId);

  if (!isOffline) {
    await vehicleRepo.changeVehcileLocationRepo(
      driverId,
      Number(ride.pickupLng),
      Number(ride.pickupLat)
    );
  }

  // 2. (Simple approach) mark ride unassigned
  const updatedRide = await rideRepo.updateRideStatusRepo(
    rideId,
    'REQUESTED'
  );

  const io = getIO();
  io.to(`ride:${rideId}`).emit('rideRejected', {
    rideId
  });

  return updatedRide;
};

export const startRide = async (
  rideId: string,
  driverId: string
) => {
  const ride = await rideRepo.getRideByIdRepo(rideId);

  if (!ride) {
    throw new AppError('Ride not found', 404);
  }

  // Ensure correct driver
  if (ride.driverId !== driverId) {
    throw new AppError('Unauthorized', 403);
  }

  // Only accepted rides can start
  if (ride.status !== 'ACCEPTED') {
    throw new AppError(
      `Cannot start ride in ${ride.status} state`,
      400
    );
  }

  // Update DB
  const updatedRide = await rideRepo.startRideRepo(rideId);

  const io = getIO();
  io.to(`ride:${rideId}`).emit('rideStarted', {
    rideId,
});

  return updatedRide;
};

// export const getAllRides = async (page = 1, limit = 10) => {
//   return rideRepo.getAllRidesRepo(page, limit);
// };

// export const getUserRides = async (
//   userId: string,
//   page = 1,
//   limit = 10
// ) => {
//   return rideRepo.getUserRidesRepo(userId, page, limit);
// };

// export const getDriverRides = async (
//   driverId: string,
//   page = 1,
//   limit = 10
// ) => {
//   return rideRepo.getDriverRidesRepo(driverId, page, limit);
// };

export const getRides = async (
  id: string,
  page = 1,
  limit = 10,
  role: string
) => {
  if(role == 'RIDER'){
    return rideRepo.getUserRidesRepo(id, page, limit);
  }
  else if(role == 'ADMIN'){
    return rideRepo.getAllRidesRepo(page, limit);
  }
  else if(role == 'DRIVER'){
    return rideRepo.getDriverRidesRepo(id, page, limit);
  }
  else{
    throw new AppError("User Can't access all rides",STATUS_CODES.FORBIDDEN)
  }
};

export const getRideDetailsById = async (
  rideId: string,
  userId: string,
  role: string
) => {
  const ride = await rideRepo.getRideDetailsByIdRepo(rideId);

  if (!ride) {
    throw new AppError('Ride not found', 404);
  }

  const isRider = ride.userId === userId;
  const isDriver = ride.driverId === userId;
  const isAdmin = role === 'ADMIN';

  if (!isRider && !isDriver && !isAdmin) {
    throw new AppError('Unauthorized access to ride', STATUS_CODES.UNAUTHORISED);
  }

  return ride;
};

