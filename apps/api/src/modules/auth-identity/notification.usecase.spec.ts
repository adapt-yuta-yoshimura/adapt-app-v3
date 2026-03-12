import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationUseCase } from './notification.usecase';
import { NotificationRepository } from './notification.repository';

/**
 * STU: Notification UseCase テスト（API-004〜006）
 * 正常系をカバー
 */
describe('NotificationUseCase', () => {
  let useCase: NotificationUseCase;
  let notificationRepo: {
    findByUserId: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    markAsRead: ReturnType<typeof vi.fn>;
    markAllAsRead: ReturnType<typeof vi.fn>;
  };

  const userId = 'user-1';
  const notificationId = 'notification-1';

  beforeEach(() => {
    vi.clearAllMocks();
    notificationRepo = {
      findByUserId: vi.fn(),
      findById: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    };

    useCase = new NotificationUseCase(
      notificationRepo as unknown as NotificationRepository,
    );
  });

  describe('getNotifications (API-004)', () => {
    it('正常系: 通知一覧取得', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // notificationRepo.findByUserId → [mockNotification]
      await expect(useCase.getNotifications(userId)).rejects.toThrow('Not implemented');
    });
  });

  describe('markAsRead (API-005)', () => {
    it('正常系: 通知既読化', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // notificationRepo.findById → mockNotification (userId一致)
      // notificationRepo.markAsRead 呼出し確認
      await expect(useCase.markAsRead(notificationId, userId)).rejects.toThrow('Not implemented');
    });

    it('異常系: 他ユーザーの通知', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // notificationRepo.findById → mockNotification (userId不一致)
      // ForbiddenException を期待
      await expect(useCase.markAsRead(notificationId, 'other-user')).rejects.toThrow('Not implemented');
    });
  });

  describe('markAllAsRead (API-006)', () => {
    it('正常系: 通知一括既読', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // notificationRepo.markAllAsRead 呼出し確認
      await expect(useCase.markAllAsRead(userId)).rejects.toThrow('Not implemented');
    });
  });
});
