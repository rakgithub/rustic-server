import { z } from 'zod';

/** Query parameters accepted by GET /products. */
export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListProductsQueryDto = z.infer<typeof listProductsQuerySchema>;
