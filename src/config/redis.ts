import Redis from 'ioredis';
import "dotenv/config";

export const redis = new Redis(process.env.REDIS_URL!); 

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis Error:', err);
});

export const connectRedis = async () => {
  return redis; 
};

export default redis;