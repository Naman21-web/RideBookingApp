import prisma from "../config/db";
import {Vehicle} from '@prisma/client';
import { createVehicleInput } from '../types/vehicle.types';

export const createVehicleRepo = async (data: createVehicleInput): Promise<Vehicle> => {
  return prisma.vehicle.create({ data });
};

export const getVehicleByUserId = async (userId: string): Promise<Vehicle> => {
  return prisma.vehicle.findUnique({
    where: { userId },
  });
};