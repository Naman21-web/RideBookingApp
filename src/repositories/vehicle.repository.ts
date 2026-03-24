import prisma from "../config/db";
import {Vehicle} from '@prisma/client';
import { createVehicleInput } from '../types/vehicle.types';
import logger from "../utils/logger";

export const createVehicleRepo = async (data: createVehicleInput): Promise<Vehicle> => {
  return prisma.vehicle.create({ data });
};

export const getVehicleByUserId = async (userId: string): Promise<Vehicle> => {
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