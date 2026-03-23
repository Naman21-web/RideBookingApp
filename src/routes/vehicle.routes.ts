import { Router } from 'express';
import { authorize, protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/user.middleware';
import { createVehicleSchema } from '../validation/vehicle.validation';
import { addVehicle } from '../controllers/vehicle.controller';

const router = Router();

router.post(
  '/',
  protect,
  authorize('DRIVER'), 
  validate(createVehicleSchema),
  addVehicle
);

export default router;