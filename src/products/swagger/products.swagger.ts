import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  type ApiBodyOptions,
  type ApiResponseOptions,
} from '@nestjs/swagger';

export const productResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    description: { type: 'string' },
    priceMinor: { type: 'integer', example: 1999 },
    brandId: { type: 'string', format: 'uuid' },
    colour: { type: 'string', example: '#8B5E3C' },
    currency: { type: 'string', example: 'EUR' },
    categoryId: { type: 'string', format: 'uuid' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

export const createProductApiBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    required: [
      'title',
      'description',
      'priceMinor',
      'brandId',
      'colour',
      'currency',
      'categoryId',
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
      brandId: { type: 'string', format: 'uuid' },
      colour: {
        type: 'string',
        pattern: '^#[0-9A-Fa-f]{6}$',
        example: '#8B5E3C',
      },
      currency: { type: 'string', pattern: '^[A-Za-z]{3}$', example: 'EUR' },
      categoryId: { type: 'string', format: 'uuid' },
    },
  },
};

export const createProductApiCreatedResponse: ApiResponseOptions = {
  description: 'Product created.',
  schema: productResponseSchema,
};

const productListResponse = {
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
};

export function ApiProductsDocs(): ClassDecorator {
  return applyDecorators(ApiTags('products'));
}

export function ApiCreateProductDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Add a product' }),
    ApiBody(createProductApiBody),
    ApiCreatedResponse(createProductApiCreatedResponse),
  );
}

export function ApiListProductsDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Get the product list' }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'One-based page number. Defaults to 1.',
    }),
    ApiQuery({
      name: 'pageSize',
      required: false,
      type: Number,
      example: 20,
      description: 'Products per page (1–100). Defaults to 20.',
    }),
    ApiOkResponse(productListResponse),
  );
}

export function ApiGetProductDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Get a product by ID' }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiNotFoundResponse({ description: 'The requested product does not exist.' }),
    ApiOkResponse({ schema: productResponseSchema }),
  );
}
