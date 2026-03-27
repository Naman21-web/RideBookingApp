import { Router } from 'express';
import { createRide, estimateFare } from '../controllers/ride.controller';
import { validate } from '../middlewares/user.middleware';
import { createRideSchema, estimateFareSchema } from '../validation/ride.validation';
import { protect } from '../middlewares/auth.middleware';

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

export default router;