import 'dotenv/config'; // .env-г ЭХЭЛЖ ачаална — бусад модулиудаас өмнө байх ёстой
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); // Set global prefix to /api

  // Global input validation — whitelist нь зөвшөөрөгдөөгүй field-ийг таслана
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global exception filter — stack trace-ийг клиент рүү явуулахгүй
  app.useGlobalFilters(new AllExceptionsFilter());

  // Serve static files from the public directory
  app.use('/public', express.static(join(process.cwd(), 'public')));

  // CORS тохиргоо — env-ийн тусламжтай
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'http://localhost:3002'];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();

