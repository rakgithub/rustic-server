import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: uuid().defaultRandom().primaryKey(),
  title: text().notNull(),
  description: text().notNull(),
  priceMinor: integer('price_minor').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
