import prisma from "../config/db";
import {User} from '@prisma/client';
import { createUserInput } from "../types/user.types";

export const createUserRepo = async (data:createUserInput): Promise<User> => {
    return prisma.user.create({data});
};

export const getAllUsersRepo = async (): Promise<User[]> => {
    return prisma.user.findMany();
};

export const getUserByIdRepo = async (id:string) : Promise<User | null> => {
    return prisma.user.findUnique({
        where: {id}
    });
};

export const getUserByEmailRepo = async (email:string) : Promise<User | null> => {
    return prisma.user.findUnique({
        where: {email}
    });
};

export const updateUserRepo = async (
  id: string,
  data: any
) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};