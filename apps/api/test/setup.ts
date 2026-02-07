/**
 * Vitest ユニットテスト用グローバルセットアップ
 */
import { vi } from 'vitest';

// NestJS Logger をモック（テスト中のログ出力を抑制）
vi.mock('@nestjs/common', async (importOriginal) => {
  const original = await importOriginal<typeof import('@nestjs/common')>();
  return {
    ...original,
    Logger: class MockLogger {
      log = vi.fn();
      error = vi.fn();
      warn = vi.fn();
      debug = vi.fn();
      verbose = vi.fn();
    },
  };
});
