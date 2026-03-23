import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/apiResponse';
import logger from '../utils/logger';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.loginUser(email, password);

  logger.info('User logged in', {
            userId: result.user.id,
            email: result.user.email,
        });

  return successResponse(res, result, 'Login successful');
});