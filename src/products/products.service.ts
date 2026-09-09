import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.module.js';
import { products } from '../database/schema.js';
import type { CreateProductDto } from './dto/create-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  /** Returns newest products first for the Commerce product overview. */
  findAll() {
    return this.db.select().from(products).orderBy(desc(products.createdAt));
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
