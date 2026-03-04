// Prisma 7 設定ファイル
// datasource.url を環境変数から取得
//
// TODO(TBD): Cursor実装 - Prisma 7 移行時に prisma-client プロバイダーへ変更
// 現在は prisma-client-js（旧プロバイダー）を使用中
// 移行ゲート条件は CLAUDE.MD §3-1 を参照

import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'schema.prisma'),
});
