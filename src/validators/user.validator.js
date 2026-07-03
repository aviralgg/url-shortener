import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
  })
  .refine((data) => data.name || data.email, {
    message: 'At least one field must be provided',
  });
