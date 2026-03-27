import { Router } from 'express';
import { acceptRide, cancelRide, completeRide, createRide, estimateFare, rejectRide, startRide } from '../controllers/ride.controller';
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

export default router;