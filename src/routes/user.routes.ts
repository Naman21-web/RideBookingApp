import { Router } from "express";
import { createUser, getAllUsers, getUserById } from "../controllers/user.controller";

const router = Router();

//POST //api/v1/users
router.post('/',createUser);
router.get('/:UserId',getUserById);
router.get('/',getAllUsers);

export default router;