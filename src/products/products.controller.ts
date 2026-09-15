import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { AdminApiKeyGuard } from '../common/guards/admin-api-key.guard.js';
import {
  createProductSchema,
  type CreateProductDto,
} from './dto/create-product.dto.js';
import {
  listProductsQuerySchema,
  type ListProductsQueryDto,
} from './dto/list-products-query.dto.js';
import { ProductsService } from './products.service.js';

const productResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    description: { type: 'string' },
    priceMinor: { type: 'integer', example: 1999 },
    brand: { type: 'string' },
    colour: { type: 'string', example: '#8B5E3C' },
    currency: { type: 'string', example: 'EUR' },
    category: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AdminApiKeyGuard)
  @ApiOperation({ summary: 'Add a product' })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'title',
        'description',
        'priceMinor',
        'brand',
        'colour',
        'currency',
        'category',
      ],
      properties: {
        title: {
          type: 'string',
          example: 'Rustic ceramic mug',
          maxLength: 200,
        },
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
        brand: { type: 'string', maxLength: 50 },
        colour: {
          type: 'string',
          pattern: '^#[0-9A-Fa-f]{6}$',
          example: '#8B5E3C',
        },
        currency: { type: 'string', pattern: '^[A-Za-z]{3}$', example: 'EUR' },
        category: { type: 'string', maxLength: 20 },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Product created.',
    schema: productResponseSchema,
  })
  create(
    @Body(new ZodValidationPipe(createProductSchema)) body: CreateProductDto,
  ) {
    return this.productsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get the product list' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'One-based page number. Defaults to 1.',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    example: 20,
    description: 'Products per page (1–100). Defaults to 20.',
  })
  @ApiOkResponse({
    description: 'Products ordered from newest to oldest.',
    schema: {
      type: 'object',
      required: ['items', 'page', 'pageSize', 'hasNextPage'],
      properties: {
        items: { type: 'array', items: productResponseSchema },
        page: { type: 'integer', example: 1 },
        pageSize: { type: 'integer', example: 20 },
        hasNextPage: { type: 'boolean', example: false },
      },
    },
  })
  findAll(
    @Query(new ZodValidationPipe(listProductsQuerySchema))
    query: ListProductsQueryDto,
  ) {
    return this.productsService.findAll(query);
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
