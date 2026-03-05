import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // TODO(TBD): Cursor実装 - CORS設定、バリデーションパイプ、Swagger設定等
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://admin.localhost.adapt:3001',
    ],
    credentials: true,
  });

  await app.listen(4000);
}
bootstrap();
