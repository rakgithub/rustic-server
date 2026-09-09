import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
  createProductSchema,
  type CreateProductDto,
} from './dto/create-product.dto.js';
import { ProductsService } from './products.service.js';

const productResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    description: { type: 'string' },
    priceMinor: { type: 'integer', example: 1999 },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a product' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'description', 'priceMinor'],
      properties: {
        title: { type: 'string', example: 'Rustic ceramic mug', maxLength: 200 },
        description: {
          type: 'string',
          example: 'Hand-finished stoneware mug for everyday use.',
          maxLength: 5000,
        },
        priceMinor: {
          type: 'integer',
          example: 2499,
          description: 'Price in the smallest currency unit, such as cents.',
          minimum: 0,
        },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Product created.', schema: productResponseSchema })
  create(
    @Body(new ZodValidationPipe(createProductSchema)) body: CreateProductDto,
  ) {
    return this.productsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get the product list' })
  @ApiOkResponse({
    description: 'Products ordered from newest to oldest.',
    schema: { type: 'array', items: productResponseSchema },
  })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNotFoundResponse({ description: 'The requested product does not exist.' })
  @ApiOkResponse({ schema: productResponseSchema })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productsService.findOne(id);
  }
}
