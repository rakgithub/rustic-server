import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

/**
 * Converts Zod validation failures into a consistent HTTP 400 response.
 * Keep this generic so every feature module can reuse it.
 */
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Request validation failed',
        errors: result.error.flatten(),
      });
    }

    return result.data;
  }
}
