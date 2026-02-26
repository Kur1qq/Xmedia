import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); // Set global prefix to /api

  // Serve static files from the public directory
  app.use('/public', express.static(join(process.cwd(), 'public')));

  // CORS тохиргоо нэмэх
  app.enableCors({
    origin: 'http://localhost:3000', // Next.js ажиллаж буй порт
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
