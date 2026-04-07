import { Worker } from 'bullmq';
import redis from '../config/redis';
import * as rideService from '../services/ride.service';
import * as vehicleRepo from '../repositories/vehicle.repository';
// import { createClient } from 'redis';
// import { createAdapter } from '@socket.io/redis-adapter';
import { publishEvent } from '../utils/pubsub';

// // --- Redis clients for Socket.IO adapter
// const pubClient = createClient({ url: process.env.REDIS_URL });
// const subClient = pubClient.duplicate();
// await pubClient.connect();
// await subClient.connect();

// // Dummy Socket.IO server just to use the adapter
// const io = new Server();
// io.adapter(createAdapter(pubClient, subClient));

console.log('🚀 Worker file loaded...');

const worker = new Worker(
  'rideQueue',
  async (job) => {
    try{
        // const io = getIO();
        console.log(`Processing job ${job.id} of type ${job.name} with data:`, job.data);

        switch (job.name) {
        case 'driverTimeout': {
            const { rideId, driverId } = job.data;
            const currentDriver = await vehicleRepo.getCurrentDriverForRideRepo(rideId);
            
            console.log(`Timeout check for ride ${rideId}: current driver is ${currentDriver}, expected ${driverId}`);
        
            // if still same driver → no response
            if (currentDriver !== driverId) {
                console.log('Driver timeout, reassigning...');
        
                // release lock
                await vehicleRepo.goAvailableRepo(driverId);
        
                try {
                    console.log("[Worker] Attempting to assign next driver for ride", rideId);
                    await publishEvent('ride-events', {
                        type: 'ASSIGN_DRIVERS',
                        rideId,
                        message: 'Driver timed out, assigning next driver',
                    });
                    // await rideService.assignNextDriver(rideId);
                } catch (err) {
                    console.log("Error from worker assignDriver: ",err);
                    console.log('No drivers available');
                    await publishEvent('ride-events', {
                        type: 'NO_DRIVERS',
                        rideId,
                        message: 'No drivers available',
                    });
                }
            }    
            break;
        }

        case 'rideExpiry': {
            // const { rideId } = job.data;

            // const ride = await rideService.getRideDetailsById(rideId);

            // if (ride.status === 'SEARCHING') {
            //   console.log('Ride expired');

            //   await rideService.cancelRideSystem(rideId);

            //   io.to(`ride:${rideId}`).emit('noDrivers', {
            //     message: 'No drivers found',
            //   });
            // }

            break;
        }

        case 'sendNotification': {
            const { userId, message } = job.data;

            // io.to(`user:${userId}`).emit('notification', {
            // message,
            // });

            break;
        }

        case 'cleanupRedis': {
            // const { rideId } = job.data;

            // await redis.del(`ride:${rideId}:drivers`);
            // await redis.del(`ride:${rideId}:currentDriver`);

            // break;
        }
        }
    } catch (err) {
        if (err.message === 'No drivers available') {
            console.log(`⚠️ No drivers available for  Notifying user...`);
            // const io = getIO();
            // io.to(`ride:${rideId}`).emit('noDrivers', { message: 'No drivers available' });
        } else {
            throw err; // rethrow unexpected errors
        }
    }
  }, 
  { connection: redis }
);

worker.on('completed', (job) => console.log('✅ Job completed:', job.id));
worker.on('failed', (job, err) => console.error('❌ Job failed:', job?.id, err));


export default worker;