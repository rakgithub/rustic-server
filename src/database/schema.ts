import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: uuid().defaultRandom().primaryKey(),
  title: text().notNull(),
  description: text().notNull(),
  priceMinor: integer('price_minor').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  category: text().notNull(),
  brand: text().notNull(),
  colour: text().notNull(),
  currency: text().notNull(),
});

export const productImages = pgTable('product_images', {
  id: uuid().defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  blobUrl: text('blob_url').notNull(),
  blobPathname: text('blob_pathname').notNull(),
  contentType: text('content_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  position: integer().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
