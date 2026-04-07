import { assignNextDriver } from '../services/ride.service';
import { redis } from './redis';
import { getIO } from './socket';

export const setupSubscriber = async () => {
  const subscriber = redis.duplicate();

  await subscriber.subscribe('ride-events');

  subscriber.on('message', (channel, message) => {
    const data = JSON.parse(message);
    const io = getIO();

    console.log('📡 Event received:', data);

    switch (data.type) {

      case 'NO_DRIVERS':
        io.to(`ride:${data.rideId}`).emit('noDrivers', {
          message: data.message,
        });
        break;

      case 'ASSIGN_DRIVERS':
        console.log(`Worker received ASSIGN_DRIVERS for ride ${data.rideId}`);
        io.to(`ride:${data.rideId}`).emit('assignNextDriver', {
          message: data.message,
        });
        assignNextDriver(data.rideId);
        break;        

      case 'USER_NOTIFICATION':
        io.to(`user:${data.userId}`).emit('notification', {
          message: data.message,
        });
        break;
    }
  });
};