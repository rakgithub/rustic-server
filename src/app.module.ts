import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RateLimitGuard } from './common/guards/rate-limit.guard.js';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from './config/environment.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { ProductsModule } from './products/products.module.js';
import { CheckoutModule } from './checkout/checkout.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    DatabaseModule,
    HealthModule,
    ProductsModule,
    CheckoutModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: RateLimitGuard }],
})
export class AppModule {}
