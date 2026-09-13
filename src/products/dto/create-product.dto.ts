import { z } from 'zod';

/**
 * Prices are stored in the smallest currency unit (for example, cents) to
 * avoid the rounding errors that occur when JavaScript uses decimal numbers.
 */
export const createProductSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().min(1, 'Description is required').max(5_000),
  priceMinor: z.number().int().nonnegative(),
  brand: z.string().trim().min(1, 'Brand is required').max(50),
  colour: z.string().trim().min(1, 'Colour is required').max(6),
  currency: z.string().trim().min(1, 'Currency is required').max(3),
  category: z.string().trim().min(1, 'Category is required').max(20),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
