import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { NotificationRepository } from './notification.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type NotificationListResponse =
  paths['/api/v1/notifications']['get']['responses']['200']['content']['application/json'];
type MarkReadResponse =
  paths['/api/v1/notifications/{notificationId}/read']['post']['responses']['201']['content']['application/json'];
type MarkAllReadResponse =
  paths['/api/v1/notifications/read-all']['post']['responses']['201']['content']['application/json'];

/**
 * 通知 UseCase
 *
 * API-004: 通知一覧取得
 * API-005: 通知既読化
 * API-006: 通知一括既読
 */
@Injectable()
export class NotificationUseCase {
  constructor(
    private readonly notificationRepo: NotificationRepository,
  ) {}

  /**
   * API-004: 通知一覧取得
   * x-roles: all
   */
  async getNotifications(userId: string): Promise<NotificationListResponse> {
    // TODO(TBD): Cursor実装
    // 1. Notification を userId でフィルタ、createdAt DESC
    // 2. ページネーション対応
    throw new Error('Not implemented');
  }

  /**
   * API-005: 通知既読化
   * x-roles: all
   */
  async markAsRead(notificationId: string, userId: string): Promise<MarkReadResponse> {
    // TODO(TBD): Cursor実装
    // 1. Notification 取得 → userId 一致確認
    // 2. readAt = now() に更新
    throw new Error('Not implemented');
  }

  /**
   * API-006: 通知一括既読
   * x-roles: all
   */
  async markAllAsRead(userId: string): Promise<MarkAllReadResponse> {
    // TODO(TBD): Cursor実装
    // 1. Notification.updateMany({ where: { userId, readAt: null }, data: { readAt: now() } })
    throw new Error('Not implemented');
  }
}
