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
import {
  ApiCreateProductDocs,
  ApiGetProductDocs,
  ApiListProductsDocs,
  ApiProductsDocs,
} from './swagger/products.swagger.js';

@ApiProductsDocs()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AdminApiKeyGuard)
  @ApiCreateProductDocs()
  create(
    @Body(new ZodValidationPipe(createProductSchema)) body: CreateProductDto,
  ) {
    return this.productsService.create(body);
  }

  @Get()
  @ApiListProductsDocs()
  findAll(
    @Query(new ZodValidationPipe(listProductsQuerySchema))
    query: ListProductsQueryDto,
  ) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiGetProductDocs()
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productsService.findOne(id);
  }
}
