CREATE TYPE "public"."checkout_status" AS ENUM('pending', 'payment_pending', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "checkout_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"checkout_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"title_snapshot" text NOT NULL,
	"unit_price_minor" integer NOT NULL,
	"currency" text NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "checkout_items_unit_price_non_negative" CHECK ("checkout_items"."unit_price_minor" >= 0),
	CONSTRAINT "checkout_items_quantity_positive" CHECK ("checkout_items"."quantity" > 0),
	CONSTRAINT "checkout_items_currency_iso_4217" CHECK ("checkout_items"."currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "checkouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "checkout_status" DEFAULT 'pending' NOT NULL,
	"idempotency_key" text NOT NULL,
	"request_fingerprint" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"blob_url" text NOT NULL,
	"blob_pathname" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_images_size_bytes_non_negative" CHECK ("product_images"."size_bytes" >= 0),
	CONSTRAINT "product_images_position_non_negative" CHECK ("product_images"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price_minor" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"category" text NOT NULL,
	"brand" text NOT NULL,
	"colour" text NOT NULL,
	"currency" text NOT NULL,
	CONSTRAINT "products_price_minor_non_negative" CHECK ("products"."price_minor" >= 0),
	CONSTRAINT "products_currency_iso_4217" CHECK ("products"."currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
ALTER TABLE "checkout_items" ADD CONSTRAINT "checkout_items_checkout_id_checkouts_id_fk" FOREIGN KEY ("checkout_id") REFERENCES "public"."checkouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_items" ADD CONSTRAINT "checkout_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "checkout_items_checkout_id_idx" ON "checkout_items" USING btree ("checkout_id");--> statement-breakpoint
CREATE UNIQUE INDEX "checkouts_idempotency_key_idx" ON "checkouts" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "product_images_product_id_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_images_product_id_position_idx" ON "product_images" USING btree ("product_id","position");--> statement-breakpoint
CREATE INDEX "products_created_at_id_idx" ON "products" USING btree ("created_at","id");