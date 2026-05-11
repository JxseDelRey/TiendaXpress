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

  // ... (tus imports y configuraciones anteriores)

  const port = process.env.PORT || 3000;
  
  // Condición para evitar que el listen bloquee a Vercel
  if (process.env.NODE_ENV !== 'production') {
    await app.listen(port);
    console.log(`🚀 TiendaXpress API corriendo en: http://localhost:${port}/api`);
  }

  // Esto es CLAVE para que Vercel pueda manejar las peticiones
  return app.getHttpAdapter().getInstance();
}

// Exportamos la promesa de la aplicación
export const handler = bootstrap();
