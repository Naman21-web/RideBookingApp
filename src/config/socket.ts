import { Server } from 'socket.io';

let io: Server;
export const userSocketMap = new Map<string, string>();

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  console.log('Socket.io initialized');

  io.on('connection', (socket) => {
    socket.on('register',(userId:string) => {
        userSocketMap.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ID ${socket.id}`);
    })

    socket.on('driverLocation', ({ rideId, lat, lng }) => {
        socket.to(`ride:${rideId}`).emit('driverLocationUpdate', {
            lat,
            lng,
        });
    });

    socket.on('joinRide', (rideId) => {
        socket.join(`ride:${rideId}`);
    });

    socket.on('disconnect', () => {
      for (const [userId, id] of userSocketMap.entries()) {
        if (id === socket.id) {
            userSocketMap.delete(userId);
        }
    }  
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket not initialized');
  return io;
};