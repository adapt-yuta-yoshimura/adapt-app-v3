// prisma.config.ts - Prisma 7 必須設定ファイル
//
// Prisma 7 では .env の自動読み込みが廃止されたため、
// dotenv で明示的にロードする。
//
// 現在は prisma-client-js（旧プロバイダー）を使用。
// 将来 prisma-client（新プロバイダー）へ移行予定。

import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrate: {
    schema: './prisma/schema.prisma',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
