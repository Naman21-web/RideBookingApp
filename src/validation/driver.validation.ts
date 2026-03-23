import { z } from 'zod';

export const createVehicleSchema = z.object({
  carModel: z.string().min(2),
  carNumber: z.string().min(5),
  color: z.string(),

  capacity: z.number().min(1).max(7),

  carType: z.enum([
    'RICKSHAW',
    'HATCHBACK',
    'SEDAN',
    'SUV',
    'SEVEN_SEATER'
  ]),
});