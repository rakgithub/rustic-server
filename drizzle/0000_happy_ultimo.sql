CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price_minor" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
