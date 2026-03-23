import { Request,Response } from "express";
import * as userService from '../services/user.service';
import { asyncHandler } from "../utils/asyncHandler";
import { STATUS_CODES } from "../utils/constants";
import { successResponse } from "../utils/apiResponse";

export const createUser = asyncHandler(async (req:Request, res:Response)  => {
    const user = await userService.createUser(req.body);
    return successResponse(res, user, 'User Created',STATUS_CODES.CREATED);
});

export const getAllUsers = asyncHandler(async (_:Request,res:Response) => {
    const users = await userService.getAllUsers();
    return successResponse(res, users, 'Users fetched',STATUS_CODES.OK);
});

export const getUserById = asyncHandler(async (req:Request,res:Response) => {
    const user = await userService.getUserById(req.params.id);
    return successResponse(res, user, 'User fetched',STATUS_CODES.OK);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id, req.body);

  return successResponse(res, user, 'User updated successfully');
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id);

  return successResponse(res, null, 'User deleted successfully');
});