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

import { z } from 'zod';

export const updateVehicleSchema = z
  .object({
    vehicleModel: z.string().min(2).optional(),
    vehicleNumber: z.string().min(5).optional(),
    color: z.string().optional(),

    capacity: z.number().min(1).max(7).optional(),

    vehicleType: z
      .enum(['RICKSHAW', 'HATCHBACK', 'SEDAN', 'SUV', 'SEVEN_SEATER'])
      .optional(),
  })
  .refine((data) => {
    // Optional advanced validation
    if (data.vehicleType === 'RICKSHAW' && data.capacity && data.capacity !== 3)
      return false;

    if (
      data.vehicleType === 'SEVEN_SEATER' &&
      data.capacity &&
      data.capacity < 6
    )
      return false;

    return true;
  }, {
    message: 'Invalid capacity for selected vehicle type',
    path: ['capacity'],
  });

export const updateLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});