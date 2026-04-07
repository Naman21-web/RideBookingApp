import { redis } from '../config/redis';

// publisher
export const publishEvent = async (channel: string, data: any) => {
  await redis.publish(channel, JSON.stringify(data));
};