import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),

  email: z.string().email('Invalid email format'),

  password: z.string().min(6,'Password must be atleast 6 characters'),


  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),

  role: z.enum(['RIDER', 'DRIVER', 'ADMIN']),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

// Body validation (partial update)
export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),

  email: z.string().email().optional(),

  phone: z
    .string()
    .regex(/^[0-9]{10}$/)
    .optional(),

  role: z.enum(['RIDER', 'DRIVER']).optional(),
});