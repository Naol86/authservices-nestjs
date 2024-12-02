import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.use(
    cors({
      origin: '*',
      methods: ['*'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
