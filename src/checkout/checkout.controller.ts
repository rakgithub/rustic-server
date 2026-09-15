import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
  createCheckoutSchema,
  type CreateCheckoutDto,
} from './dto/create-checkout.dto.js';
import { CheckoutService } from './checkout.service.js';

@ApiTags('checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @ApiOperation({ summary: 'Create a checkout from a product snapshot' })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: true,
    description: 'Unique key for safely retrying this request.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['productId', 'quantity'],
      properties: {
        productId: { type: 'string', format: 'uuid' },
        quantity: { type: 'integer', minimum: 1, maximum: 100 },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Checkout created or returned from an idempotent retry.',
  })
  async create(
    @Body(new ZodValidationPipe(createCheckoutSchema)) body: CreateCheckoutDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey || idempotencyKey.length > 128) {
      throw new BadRequestException(
        'Idempotency-Key is required and must not exceed 128 characters.',
      );
    }

    return this.checkoutService.create(body, idempotencyKey);
  }
}
