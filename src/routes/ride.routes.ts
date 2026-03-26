import { Router } from 'express';
import { estimateFare } from '../controllers/ride.controller';
import { validate } from '../middlewares/user.middleware';
import { estimateFareSchema } from '../validation/ride.validation';

const router = Router();

router.get(
  '/estimate',
  validate(estimateFareSchema, 'query'),
  estimateFare
);

export default router;