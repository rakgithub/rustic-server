import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { ProductsModule } from './products/products.module.js';

@Module({
  imports: [
    // Makes values from .env, such as DATABASE_URL, available throughout Nest.
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
