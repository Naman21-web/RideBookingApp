import bcrypt from 'bcryptjs';
import * as userRepo from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { generateAccessToken, generateRefreshToken, generateToken, verifyToken } from '../utils/jwt';
import { STATUS_CODES } from '../utils/constants';

export const loginUser = async (email: string, password: string) => {
  const user = await userRepo.getUserByEmailRepo(email);

  if (!user) {
    throw new AppError('Invalid credentials', STATUS_CODES.UNAUTHORISED);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError('Invalid credentials', STATUS_CODES.UNAUTHORISED);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const hashed = await bcrypt.hash(refreshToken, 10);

  const updateUser = await userRepo.updateUserRepo(user.id, { refreshToken: hashed });


  return { user, accessToken, refreshToken };
};

export const logoutService = async (userId: string) => {
  await userRepo.updateUserRepo(userId,{ refreshToken: null });
  

  return true;
};

export const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError('No refresh token', STATUS_CODES.UNAUTHORISED);
  }

  let decoded: any;

  try {
    decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET!);
  } catch {
    throw new AppError('Invalid refresh token', STATUS_CODES.UNAUTHORISED);
  }

  const user = await userRepo.getUserByIdRepo(decoded.userId);

  if (!user || !user.refreshToken) {
    throw new AppError('Invalid refresh token', STATUS_CODES.UNAUTHORISED);
  }

  const isValid = await bcrypt.compare(refreshToken, user.refreshToken); 

   if(!isValid) {
    // 🚨 Possible token reuse attack
    await userRepo.updateUserRepo(user.id,{ refreshToken: null });

    throw new AppError('Refresh token reuse detected', STATUS_CODES.FORBIDDEN);
  }

  // 4. Generate NEW tokens
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  // 5. Hash and store NEW refresh token (ROTATION)
  const hashed = await bcrypt.hash(newRefreshToken, 10);

  await userRepo.updateUserRepo(user.id,{ refreshToken: hashed });

  return { newAccessToken, newRefreshToken };
};