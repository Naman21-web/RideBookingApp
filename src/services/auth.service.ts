import bcrypt from 'bcryptjs';
import * as userRepo from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { generateToken } from '../utils/jwt';

export const loginUser = async (email: string, password: string) => {
  const user = await userRepo.getUserByEmailRepo(email);

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = generateToken({
    userId: user.id,
    role: user.role,
  });

  return { user, token };
};