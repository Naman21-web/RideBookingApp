import { Router } from "express";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/user.controller";
import { validate } from "../middlewares/user.middleware";
import { createUserSchema, updateUserSchema, userIdParamSchema } from "../validation/user.validation";

const router = Router();

//POST //api/v1/users
router.post('/',validate(createUserSchema,'body'),createUser);
router.get('/:id',getUserById);
router.get('/',getAllUsers);
router.patch(
  '/:id',
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema, 'body'),
  updateUser
);
router.delete(
  '/:id',
  validate(userIdParamSchema, 'params'),
  deleteUser
);

export default router;