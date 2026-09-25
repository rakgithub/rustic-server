CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "brands_name_idx" ON "brands" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_name_idx" ON "categories" USING btree ("name");--> statement-breakpoint
INSERT INTO "brands" ("name")
SELECT DISTINCT "brand" FROM "products"
ON CONFLICT ("name") DO NOTHING;--> statement-breakpoint
INSERT INTO "categories" ("name")
SELECT DISTINCT "category" FROM "products"
ON CONFLICT ("name") DO NOTHING;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "brand_id" uuid;--> statement-breakpoint
UPDATE "products" AS "product"
SET "brand_id" = "brand"."id"
FROM "brands" AS "brand"
WHERE "brand"."name" = "product"."brand";--> statement-breakpoint
UPDATE "products" AS "product"
SET "category_id" = "category"."id"
FROM "categories" AS "category"
WHERE "category"."name" = "product"."category";--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "brand_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "products_brand_id_idx" ON "products" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "brand";
