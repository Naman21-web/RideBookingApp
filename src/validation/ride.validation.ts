import { z } from 'zod';

export const estimateFareSchema = z.object({
  pickupLat: z.coerce.number(),
  pickupLng: z.coerce.number(),
  dropLat: z.coerce.number(),
  dropLng: z.coerce.number(),
});

export const createRideSchema = z.object({
  pickupLat: z.number(),
  pickupLng: z.number(),
  dropLat: z.number(),
  dropLng: z.number(),
  vehicleType: z.enum([
    'RICKSHAW',
    'HATCHBACK',
    'SEDAN',
    'SUV',
    'SEVEN_SEATER',
  ]),
});