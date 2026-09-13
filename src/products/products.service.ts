import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { count, desc, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.module.js';
import { products } from '../database/schema.js';
import type { CreateProductDto } from './dto/create-product.dto.js';
import type { ListProductsQueryDto } from './dto/list-products-query.dto.js';

@Injectable()
export class ProductsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  /** Returns one newest-first page for the Commerce product overview. */
  async findAll({ page, pageSize }: ListProductsQueryDto) {
    const offset = (page - 1) * pageSize;

    const [[{ total }], items] = await Promise.all([
      this.db.select({ total: count() }).from(products),
      this.db
        .select()
        .from(products)
        .orderBy(desc(products.createdAt))
        .limit(pageSize)
        .offset(offset),
    ]);

    return {
      items,
      page,
      pageSize,
      hasNextPage: offset + items.length < total,
    };
  }

  async findOne(id: string) {
    const [product] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!product) {
      throw new NotFoundException(`Product ${id} was not found`);
    }

    return product;
  }

  async create(input: CreateProductDto) {
    const [product] = await this.db.insert(products).values(input).returning();
    return product;
  }
}
