import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationSettingsUseCase } from './notification-settings.usecase';
import { NotificationSettingsRepository } from './notification-settings.repository';

/**
 * STU: NotificationSettings UseCase テスト（API-007〜008）
 * 正常系をカバー
 */
describe('NotificationSettingsUseCase', () => {
  let useCase: NotificationSettingsUseCase;
  let settingsRepo: {
    findByUserId: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
  };

  const userId = 'user-1';

  beforeEach(() => {
    vi.clearAllMocks();
    settingsRepo = {
      findByUserId: vi.fn(),
      upsert: vi.fn(),
    };

    useCase = new NotificationSettingsUseCase(
      settingsRepo as unknown as NotificationSettingsRepository,
    );
  });

  describe('getSettings (API-007)', () => {
    it('正常系: 通知設定取得', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // settingsRepo.findByUserId → mockSettings
      await expect(useCase.getSettings(userId)).rejects.toThrow('Not implemented');
    });

    it('正常系: 設定未作成時はデフォルト値', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // settingsRepo.findByUserId → null
      // デフォルト値を含むレスポンスを期待
      await expect(useCase.getSettings(userId)).rejects.toThrow('Not implemented');
    });
  });

  describe('updateSettings (API-008)', () => {
    it('正常系: 通知設定更新', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // settingsRepo.upsert 呼出し確認
      await expect(
        useCase.updateSettings(userId, { data: {} }),
      ).rejects.toThrow('Not implemented');
    });
  });
});
