import { z } from 'zod';

export const createCheckoutSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().min(1).max(100),
});

export type CreateCheckoutDto = z.infer<typeof createCheckoutSchema>;
