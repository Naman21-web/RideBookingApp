import { Router } from 'express';
import { acceptRide, cancelRide, completeRide, createRide, estimateFare, getAllRides, getDriverRides, getRideDetailsById, getRides, getUserRides, rejectRide, startRide } from '../controllers/ride.controller';
import { validate } from '../middlewares/user.middleware';
import { createRideSchema, estimateFareSchema } from '../validation/ride.validation';
import { authorize, protect } from '../middlewares/auth.middleware';

const router = Router();

router.get(
  '/estimate',
  validate(estimateFareSchema, 'query'),
  estimateFare
);

router.post(
  '/',
  protect,
  authorize('RIDER'),
  validate(createRideSchema),
  createRide
);

router.patch(
  '/:rideId/cancel', 
  protect, 
  cancelRide
);

router.patch(
  '/:rideId/complete', 
  protect,
  authorize('DRIVER'), 
  completeRide
);

router.patch(
  '/:rideId/accept',  
  protect,
  authorize('DRIVER'),
  acceptRide
);
router.patch(
  '/:rideId/reject', 
  protect,
  authorize('DRIVER'), 
  rejectRide
);

router.patch(
  '/:rideId/start', 
  protect,
  authorize('DRIVER'), 
  startRide
);

// router.get(
//   '/', 
//   protect,
//   authorize('ADMIN'), 
//   getAllRides
// );

// router.get(
//   '/user', 
//   protect,
//   authorize('RIDER'),  
//   getUserRides
// );

// router.get(
//   '/driver', 
//   protect,
//   authorize('DRIVER'), 
//   getDriverRides
// );

router.get(
  '/', 
  protect, 
  getRides
);

router.get(
  '/:rideId', 
  protect, 
  getRideDetailsById
);

export default router;