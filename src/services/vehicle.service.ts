import * as vehicleRepo from '../repositories/vehicle.repository';
import * as userRepo from '../repositories/user.repository';
import { createVehicleInput } from '../types/vehicle.types';
import { AppError } from '../utils/AppError';
import { STATUS_CODES } from '../utils/constants';


export const addVehicle = async (userId: string, data: createVehicleInput) => {
    const user = await userRepo.getUserByIdRepo(userId);

    if(!user){
        throw new AppError('User not found',STATUS_CODES.NOT_FOUND);
    }

    if(user.role !== 'DRIVER'){
        throw new AppError('Only driver can add vehicle',STATUS_CODES.NOT_FOUND);
    }

    const existingVehicle = await vehicleRepo.getVehicleByUserIdRepo(userId);

    if(existingVehicle){
        throw new AppError("Vehicle already exist for user",STATUS_CODES.BAD_REQUEST);
    }
    return vehicleRepo.createVehicleRepo({
        ...data,
        userId
    });
};

export const updateVehicle = async (
  userId: string,
  data: any
) => {
    if (!Object.keys(data).length) {
        throw new AppError('No fields provided for update', STATUS_CODES.BAD_REQUEST);
    }

  const vehicle = await vehicleRepo.getVehicleByUserIdRepo(userId);

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  return vehicleRepo.updateVehicleRepo(vehicle.id, data);
};

export const getVehicle = async (userId: string) => {
  const vehicle = await vehicleRepo.getVehicleByUserIdRepo(userId);

  if (!vehicle) {
    throw new AppError('Vehicle not found', STATUS_CODES.NOT_FOUND);
  }

  return vehicle;
};

export const getAllVehicles = async () => {
  return vehicleRepo.getAllVehiclesRepo();
};

export const updateVehicleLocation = async (
  userId: string,
  lat: number,
  lng: number
) => {     
    await vehicleRepo.updateVehicleLocationRepo(userId, lat, lng);
};

export const getNearbyVehicles = async (
  lat: number,
  lng: number,
  radius: number,
  vehicleType
) => {
  const driverIds:(string | null)[] = await vehicleRepo.getNearbyDriverIdsRepo(
    lat,
    lng,
    radius
  );

  const users = await vehicleRepo.getVehiclesByUserIdsRepo(driverIds,vehicleType);
  return users;
};

export const goOffline = async (userId: string) => {
    vehicleRepo.goOfflineRepo(userId);
};

export const goOnline = async (userId: string) => {
    vehicleRepo.goOnlineRepo(userId);
};

export const goBusy = async (userId:string) => {
    vehicleRepo.goBusyRepo(userId);
}

export const goAvailable = async (userId:string) => {
    vehicleRepo.goAvailableRepo(userId);
}
 