import { z } from 'zod';

/**
 * Prices are stored in the smallest currency unit (for example, cents) to
 * avoid the rounding errors that occur when JavaScript uses decimal numbers.
 */
export const createProductSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().min(1, 'Description is required').max(5_000),
  priceMinor: z.number().int().min(0).max(100_000_000),
  brand: z.string().trim().min(1, 'Brand is required').max(50),
  colour: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Colour must be a six-digit hex value'),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, 'Currency must be a three-letter ISO code')
    .transform((value) => value.toUpperCase()),
  category: z.string().trim().min(1, 'Category is required').max(20),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
