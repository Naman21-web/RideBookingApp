import * as userRepo from '../repositories/user.repository';
import { createUserInput } from '../types/user.types';
import {User} from '@prisma/client';
import { AppError } from '../utils/AppError';
import { STATUS_CODES } from '../utils/constants';

export const createUser = async (data: createUserInput) : Promise<User> => {
    const existingUser = await userRepo.getUserByEmailRepo(data.email);
    if(existingUser){
        throw new AppError("Email already exists",STATUS_CODES.BAD_REQUEST)
    }
    return userRepo.createUserRepo(data);
};

export const getAllUsers = async ():Promise<User[]> => {
    return userRepo.getAllUsersRepo();
}

export const getUserById = async (id:string): Promise<User | null> => {
    const user = userRepo.getUserByIdRepo(id);
    if(!user){
        throw new AppError("User not found",STATUS_CODES.NOT_FOUND);
    }
    return user;
};

export const updateUser = async (
  id: string,
  data: any
) => {
  // Check user exists
  const existingUser = await userRepo.getUserByIdRepo(id);

  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  // Optional: email uniqueness check
  if (data.email) {
    const emailUser = await userRepo.getUserByEmailRepo(data.email);

    if (emailUser && emailUser.id !== id) {
      throw new AppError('Email already in use', 400);
    }
  }

  return userRepo.updateUserRepo(id, data);
};