import { z } from 'zod';

export const createVehicleSchema = z.object({
  vehicleModel: z.string().min(2),
  vehicleNumber: z.string().min(5),
  color: z.string(),

  capacity: z.number().min(1).max(7),

  vehicleType: z.enum([
    'RICKSHAW',
    'HATCHBACK',
    'SEDAN',
    'SUV',
    'SEVEN_SEATER'
  ]),
});