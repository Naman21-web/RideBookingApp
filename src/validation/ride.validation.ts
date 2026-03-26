import { z } from 'zod';

export const estimateFareSchema = z.object({
  pickupLat: z.coerce.number(),
  pickupLng: z.coerce.number(),
  dropLat: z.coerce.number(),
  dropLng: z.coerce.number(),
});