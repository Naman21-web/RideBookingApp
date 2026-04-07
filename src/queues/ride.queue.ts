import { Queue } from 'bullmq';
import {redis} from '../config/redis';

export const rideQueue = new Queue('rideQueue', {
  connection: redis,
}); 