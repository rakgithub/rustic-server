import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3006),
  DATABASE_URL: z.string().url(),
  CORS_ORIGINS: z.string().optional(),
  ADMIN_API_KEY: z.string().min(32).optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .min(1_000)
    .max(3_600_000)
    .default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(10_000).default(120),
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(
  config: Record<string, unknown>,
): Environment {
  const parsed = environmentSchema.safeParse(config);

  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration: ${parsed.error.message}`,
    );
  }

  if (parsed.data.NODE_ENV === 'production' && !parsed.data.CORS_ORIGINS) {
    throw new Error('CORS_ORIGINS is required in production.');
  }

  if (parsed.data.NODE_ENV === 'production' && !parsed.data.ADMIN_API_KEY) {
    throw new Error('ADMIN_API_KEY is required in production.');
  }

  return parsed.data;
}
