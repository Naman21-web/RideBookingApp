import "dotenv/config";
import http from "http";

import app from './app';
import { connectDB } from './config/db';
import { connectRedis } from "./config/redis";
import { initSocket } from "./config/socket";
import { setupSubscriber } from "./config/subs";

const PORT = process.env.PORT || 5000;

const startServer = async () => {

  await connectDB();
  await connectRedis();
  await setupSubscriber();

  //  Create HTTP server manually
  const server = http.createServer(app);

  // ✅ Initialize socket with server
  initSocket(server);

  //  Start server
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();



