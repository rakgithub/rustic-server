import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const localFrontendOrigins = [
    'http://localhost:5100',
    'http://localhost:5101',
    'http://localhost:5102',
    'http://127.0.0.1:5100',
    'http://127.0.0.1:5101',
    'http://127.0.0.1:5102',
  ];
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim())
    .filter(Boolean) ?? localFrontendOrigins;

  app.enableCors({
    origin: allowedOrigins,
    allowedHeaders: ['Content-Type', 'x-user-id'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tasks API')
    .setDescription('A learning API built with NestJS, Drizzle, and PostgreSQL.')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3006);
}
await bootstrap();
