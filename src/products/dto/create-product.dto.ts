import { z } from 'zod';

/**
 * Prices are stored in the smallest currency unit (for example, cents) to
 * avoid the rounding errors that occur when JavaScript uses decimal numbers.
 */
export const createProductSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().min(1, 'Description is required').max(5_000),
  priceMinor: z.number().int().nonnegative(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
