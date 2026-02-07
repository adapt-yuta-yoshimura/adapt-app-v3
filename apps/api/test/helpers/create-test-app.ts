import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';

/**
 * E2Eテスト用のNestJSアプリケーションを作成
 * テスト用データベースを使用し、テスト後にクリーンアップ可能
 */
export async function createTestApp(): Promise<{
  app: INestApplication;
  module: TestingModule;
  prisma: PrismaService;
}> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  await app.init();

  const prisma = moduleFixture.get<PrismaService>(PrismaService);

  return { app, module: moduleFixture, prisma };
}

/**
 * テスト用データベースのクリーンアップ
 * テーブルを truncate してテスト間のデータ干渉を防ぐ
 */
export async function cleanupDatabase(prisma: PrismaService): Promise<void> {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations');

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
  }
}
