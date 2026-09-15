import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const checkoutStatus = pgEnum('checkout_status', [
  'pending',
  'payment_pending',
  'completed',
  'failed',
  'cancelled',
]);

export const products = pgTable(
  'products',
  {
    id: uuid().defaultRandom().primaryKey(),
    title: text().notNull(),
    description: text().notNull(),
    priceMinor: integer('price_minor').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    category: text().notNull(),
    brand: text().notNull(),
    colour: text().notNull(),
    currency: text().notNull(),
  },
  (table) => [
    check('products_price_minor_non_negative', sql`${table.priceMinor} >= 0`),
    check('products_currency_iso_4217', sql`${table.currency} ~ '^[A-Z]{3}$'`),
    index('products_created_at_id_idx').on(table.createdAt, table.id),
  ],
);

export const productImages = pgTable(
  'product_images',
  {
    id: uuid().defaultRandom().primaryKey(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    blobUrl: text('blob_url').notNull(),
    blobPathname: text('blob_pathname').notNull(),
    contentType: text('content_type').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    position: integer().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      'product_images_size_bytes_non_negative',
      sql`${table.sizeBytes} >= 0`,
    ),
    check('product_images_position_non_negative', sql`${table.position} >= 0`),
    index('product_images_product_id_idx').on(table.productId),
    uniqueIndex('product_images_product_id_position_idx').on(
      table.productId,
      table.position,
    ),
  ],
);

export const checkouts = pgTable(
  'checkouts',
  {
    id: uuid().defaultRandom().primaryKey(),
    status: checkoutStatus().notNull().default('pending'),
    idempotencyKey: text('idempotency_key').notNull(),
    requestFingerprint: text('request_fingerprint').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('checkouts_idempotency_key_idx').on(table.idempotencyKey),
  ],
);

export const checkoutItems = pgTable(
  'checkout_items',
  {
    id: uuid().defaultRandom().primaryKey(),
    checkoutId: uuid('checkout_id')
      .notNull()
      .references(() => checkouts.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    titleSnapshot: text('title_snapshot').notNull(),
    unitPriceMinor: integer('unit_price_minor').notNull(),
    currency: text().notNull(),
    quantity: integer().notNull(),
  },
  (table) => [
    check(
      'checkout_items_unit_price_non_negative',
      sql`${table.unitPriceMinor} >= 0`,
    ),
    check('checkout_items_quantity_positive', sql`${table.quantity} > 0`),
    check(
      'checkout_items_currency_iso_4217',
      sql`${table.currency} ~ '^[A-Z]{3}$'`,
    ),
    index('checkout_items_checkout_id_idx').on(table.checkoutId),
  ],
);
