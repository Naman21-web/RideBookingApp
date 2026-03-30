import prisma from "../config/db";
import {Vehicle} from '@prisma/client';
import { createVehicleInput } from '../types/vehicle.types';
import redis from '../config/redis';

export const createVehicleRepo = async (data: createVehicleInput): Promise<Vehicle> => {
  return prisma.vehicle.create({ data });
};

export const getVehicleByUserIdRepo = async (userId: string): Promise<Vehicle> => {
  return prisma.vehicle.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const updateVehicleRepo = async (
  id: string,
  data: any
) => {
  // logger.info("user data",data,id)
  return await prisma.vehicle.update({
    where: { id },
    data,
  });
};

export const getAllVehiclesRepo = async () => {
  return prisma.vehicle.findMany({
    select: {
      id: true,
      vehicleModel: true,
      vehicleType: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const getVehiclesByUserIdsRepo = async (driverIds:(string | null)[],vehicleType) => {
  return prisma.vehicle.findMany({
    where: {
      userId: { in: driverIds },
      ...(vehicleType && { vehicleType }), 
    },
    select: {
      id: true,
      vehicleModel: true,
      vehicleType: true,
      capacity: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export const updateVehicleLocationRepo = async (
  userId: string,
  lat: number,
  lng: number
) => {
  const isOffline = await redis.get(`driver:${userId}:offline`);

  if (isOffline) return;

  const hasActiveRide = await redis.get(`driver:${userId}:activeRide`);

  if (!hasActiveRide) {
    await changeVehcileLocationRepo(userId,lat,lng)
  }
};

export const changeVehcileLocationRepo = async (
  userId: string,
  lat: number,
  lng: number
) => {
  await redis.geoadd(
    'drivers:available:locations',
    lng,
    lat,
    userId
  );
}

export const getNearbyDriverIdsRepo = async (
  lat: number,
  lng: number,
  radius: number
) : Promise<(string | null)[]>=> {
  const driverIds = await redis.geosearch(
    'drivers:available:locations',
    'FROMLONLAT',
    lng,
    lat,
    'BYRADIUS',
    radius,
    'km'
  );
  
  console.log("DriverIds: ",driverIds);
  
  return driverIds;
};

export const goOfflineRepo = async (userId: string) => {
  await redis.zrem('drivers:available:locations', userId);

  await redis.set(`driver:${userId}:offline`, '1');
};

export const checkOfflineRepo = async (userId: string)  => {
  const isOffline = redis.get(`driver:${userId}:offline`);
  return isOffline;
}

export const goOnlineRepo = async (userId: string) => {
  await redis.del(`driver:${userId}:offline`);
};

export const goBusyRepo = async (userId:string) => {
  const result = await redis.set(`driver:${userId}:busy`,'1','NX','EX',300);
  return result === 'OK';
}

export const goAvailableRepo = async (userId:string) => {
  await redis.del(`driver:${userId}:busy`);
}

export const goActiveRepo = async (userId:string) => {
  await redis.set(`driver:${userId}:activeRide`, '1');
  await redis.zrem(
        'drivers:available:locations',
        userId
      );
}

export const  goInactiveRepo = async (userId:string) => {
  await redis.del(`driver:${userId}:activeRide`);
};

export const completeRideRepo = async (rideId: string) => {
  return prisma.ride.update({
    where: { id: rideId },
    data: {
      status: 'COMPLETED',
      // completedAt: new Date(),
    },
  });
};

