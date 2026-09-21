import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableShutdownHooks();
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useBodyParser('json', { limit: '100kb' });
  app.use((request: Request, response: Response, next: NextFunction) => {
    const requestId = request.header('x-request-id') ?? crypto.randomUUID();
    response.setHeader('X-Request-Id', requestId);
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'no-referrer');
    if (process.env.NODE_ENV === 'production') {
      response.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains',
      );
    }
    next();
  });

  const localFrontendOrigins = [
    'http://localhost:5100',
    'http://localhost:5101',
    'http://localhost:5102',
    'http://127.0.0.1:5100',
    'http://127.0.0.1:5101',
    'http://127.0.0.1:5102',
  ];
  const allowedOrigins =
    process.env.CORS_ORIGINS?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? localFrontendOrigins;

  app.enableCors({
    origin: allowedOrigins,
    allowedHeaders: ['Content-Type', 'Idempotency-Key', 'x-admin-api-key'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Rustic Commerce API')
    .setDescription('Product catalog and checkout API.')
    .setVersion('1.0')
    .build();

  if (process.env.NODE_ENV !== 'production') {
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(process.env.PORT ?? 3006, '0.0.0.0');
}
await bootstrap();
