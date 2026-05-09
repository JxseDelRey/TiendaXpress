import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Habilitar CORS para el frontend Vue
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefijo global de la API
  app.setGlobalPrefix('api');

  // Servir archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 TiendaXpress API corriendo en: http://localhost:${port}/api`);
}
bootstrap();
