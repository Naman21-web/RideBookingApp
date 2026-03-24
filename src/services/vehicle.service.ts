import * as vehcileRepo from '../repositories/vehicle.repository';
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

    const existingVehicle = await vehcileRepo.getVehicleByUserId(userId);

    if(existingVehicle){
        throw new AppError("Vehicle already exist for user",STATUS_CODES.BAD_REQUEST);
    }
    return vehcileRepo.createVehicleRepo({
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

  const vehicle = await vehcileRepo.getVehicleByUserId(userId);

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  return vehcileRepo.updateVehicleRepo(vehicle.id, data);
};