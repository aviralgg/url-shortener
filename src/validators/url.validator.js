import { z } from 'zod';

const shortCodeSchema = z
  .string()
  .min(3, 'Short code must be at least 3 characters')
  .max(32, 'Short code must be at most 32 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Short code can only contain letters, numbers, underscores, and hyphens');

export const createUrlSchema = z.object({
  original_url: z.string().url('Invalid URL'),
  short_code: shortCodeSchema.optional(),
  expires_at: z.string().datetime().optional(),
});

export const urlIdParamSchema = z.object({
  id: z.string().uuid('Invalid URL id'),
});

export const shortCodeParamSchema = z.object({
  shortCode: z.string().min(1),
});
