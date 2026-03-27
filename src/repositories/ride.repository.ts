import prisma from "../config/db";
import {Ride} from '@prisma/client';
import { CreateRideInput } from "../types/ride.types";

export const createRideRepo = async (data:CreateRideInput): Promise<Ride> => {

    console.log("Prisme keys",Object.keys(prisma));

    console.log("Data: ",data);

    return prisma.ride.create({data});
};

export const getRideByIdRepo = async (rideId: string) => {
  return prisma.ride.findUnique({
    where: { id: rideId },
  });
};

export const cancelRideRepo = async (
  rideId: string,
  reason?: string
) => {
  return prisma.ride.update({
    where: { id: rideId },
    data: {
      status: 'CANCELLED',
      cancelReason: reason,
    },
  });
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

export const updateRideStatusRepo = async (
  rideId: string,
  status: string
) => {
  return prisma.ride.update({
    where: { id: rideId },
    data: { status },
  });
};

export const startRideRepo = async (rideId: string) => {
  return prisma.ride.update({
    where: { id: rideId },
    data: {
      status: 'ONGOING',
      // startedAt: new Date(),
    },
  });
};

export const getAllRidesRepo = async (
  page: number,
  limit: number
) => {
  return prisma.ride.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true } },
      driver: { select: { id: true, name: true } },
      vehicle: true,
    },
  });
};

export const getUserRidesRepo = async (
  userId: string,
  page: number,
  limit: number
) => {
  return prisma.ride.findMany({
    where: { userId },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      driver: { select: { id: true, name: true } },
      vehicle: true,
    },
  });
};

export const getDriverRidesRepo = async (
  driverId: string,
  page: number,
  limit: number
) => {
  return prisma.ride.findMany({
    where: { driverId },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true } },
      vehicle: true,
    },
  });
};