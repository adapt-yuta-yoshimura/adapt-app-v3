import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // TODO(TBD): Cursor実装 - CORS設定、バリデーションパイプ、Swagger設定等
  app.enableCors();

  await app.listen(4000);
}
bootstrap();
