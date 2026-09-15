# Rustic Commerce API

NestJS, PostgreSQL, Drizzle, and Zod power a modular commerce API. Products and checkout are modules of one deployable application so they share an ACID transaction boundary.

## Run locally

1. Copy `.env.example` to `.env` and provide a database URL.
2. Install dependencies with `corepack enable && pnpm install`.
3. Run `pnpm db:migrate`.
4. Run `pnpm start:dev`.

`GET /health/live` is a process liveness probe and `GET /health/ready` also checks PostgreSQL. Swagger is available at `/docs` outside production.

## API boundaries

- `POST /products` requires `x-admin-api-key` when `ADMIN_API_KEY` is configured (always required in production).
- `POST /checkout` requires an `Idempotency-Key` header. A checkout captures the current product title, unit price, and currency in the same database transaction.
- Payment processing and inventory reservation remain integrations to add behind the checkout module once a provider and inventory policy are selected.

## Delivery

`docker compose up --build` starts PostgreSQL, applies migrations, and only then starts the API. Set `POSTGRES_PASSWORD` before running it.

CI should run `pnpm lint`, `pnpm test`, `pnpm test:e2e`, `pnpm build`, and apply migrations to a disposable PostgreSQL database.
