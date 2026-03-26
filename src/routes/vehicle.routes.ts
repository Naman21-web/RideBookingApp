import { Router } from 'express';
import { authorize, protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/user.middleware';
import { createVehicleSchema, nearbyVehiclesSchema, updateLocationSchema, updateVehicleSchema } from '../validation/vehicle.validation';
import { addVehicle, getAllVehicles, getNearbyVehicles, getVehicle, goAvailable, goBusy, goOffline, goOnline, updateLocation, updateVehicle } from '../controllers/vehicle.controller';

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

router.get(
  '/all',
  protect,
  authorize('ADMIN'), 
  getAllVehicles
);

router.post(
  '/location',
  protect,
  authorize('DRIVER'),
  validate(updateLocationSchema),
  updateLocation
);

router.get(
  '/nearby',
  protect,
  validate(nearbyVehiclesSchema, 'query'),
  getNearbyVehicles
);

router.post(
  '/offline',
  protect,
  authorize('DRIVER'),  
  goOffline
);

router.post(
  '/online',
  protect,
  authorize('DRIVER'),  
  goOnline
);


router.post(
  '/busy',
  protect,
  authorize('DRIVER'),  
  goBusy
);

router.post(
  '/available',
  protect,
  authorize('DRIVER'),  
  goAvailable
);

export default router;