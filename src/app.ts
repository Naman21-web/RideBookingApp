import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from "cookie-parser";
import { errorHandler } from './middlewares/error.middleware';

import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import rideRoutes from './routes/ride.routes';
import { requestLogger } from './middlewares/requestLogger.middleware';
import logger from './utils/logger';
import authRoutes from './routes/auth.routes';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
// app.use(morgan('dev'));
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);
app.use(requestLogger);
app.use(cookieParser());

app.use('/api/v1/users',userRoutes)
app.use('/api/v1/auth',authRoutes)
app.use('/api/v1/vehicles',vehicleRoutes)
app.use('/api/v1/rides',rideRoutes)

app.use(errorHandler);//errorMiddleware must be last

export default app;