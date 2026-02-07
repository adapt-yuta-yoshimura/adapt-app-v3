import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 4000;
  const logger = new Logger('Bootstrap');

  app.enableCors({
    origin: [
      process.env.APP_URL ?? 'http://app.localhost.adapt:3000',
      process.env.ADMIN_URL ?? 'http://admin.localhost.adapt:3001',
      process.env.AUTH_URL ?? 'http://auth.localhost.adapt:3002',
    ],
    credentials: true,
  });

  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
