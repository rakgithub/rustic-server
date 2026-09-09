import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

/** Owns all product HTTP and application logic. */
@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
