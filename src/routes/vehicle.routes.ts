import { Router } from 'express';
import { authorize, protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/user.middleware';
import { createVehicleSchema, updateVehicleSchema } from '../validation/vehicle.validation';
import { addVehicle, getVehicle, updateVehicle } from '../controllers/vehicle.controller';

const router = Router();

router.post(
  '/',
  protect,
  authorize('DRIVER'), 
  validate(createVehicleSchema),
  addVehicle
);
router.patch(
  '/',
  protect,
  authorize('DRIVER'),
  validate(updateVehicleSchema),
  updateVehicle
);

router.get(
  '/',
  protect,
  authorize('DRIVER'),
  getVehicle
);

export default router;