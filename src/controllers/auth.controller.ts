import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/apiResponse';
import logger from '../utils/logger';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { user,accessToken, refreshToken } = await authService.loginUser(email, password);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });

  logger.info('User logged in', {
            userId: user.id,
            email: user.email,
        });

  return successResponse(res, {user,accessToken}, 'Login successful');
});

export const refreshToken = asyncHandler(async (req, res) => {
  console.log("Cookies: ",req.cookies);
  const token = req.cookies.refreshToken;

  const {newAccessToken, newRefreshToken} = await authService.refreshAccessToken(token);

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });

  return successResponse(
    res,
    { newAccessToken },
    'Token refreshed'
  );
});

