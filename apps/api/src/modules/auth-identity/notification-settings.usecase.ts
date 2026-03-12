import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { NotificationSettingsRepository } from './notification-settings.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type NotificationSettingView =
  paths['/api/v1/users/me/settings/notifications']['get']['responses']['200']['content']['application/json'];
type NotificationSettingUpdateBody =
  paths['/api/v1/users/me/settings/notifications']['put']['requestBody']['content']['application/json'];
type SuccessResponse =
  paths['/api/v1/users/me/settings/notifications']['put']['responses']['200']['content']['application/json'];

/**
 * 通知設定 UseCase
 *
 * API-007: 通知設定取得
 * API-008: 通知設定更新
 */
@Injectable()
export class NotificationSettingsUseCase {
  constructor(
    private readonly settingsRepo: NotificationSettingsRepository,
  ) {}

  /**
   * API-007: 通知設定取得
   * x-roles: all
   */
  async getSettings(userId: string): Promise<NotificationSettingView> {
    // TODO(TBD): Cursor実装
    // 1. UserNotificationSetting 取得（なければデフォルト値で返却）
    throw new Error('Not implemented');
  }

  /**
   * API-008: 通知設定更新
   * x-roles: all
   */
  async updateSettings(userId: string, body: NotificationSettingUpdateBody): Promise<SuccessResponse> {
    // TODO(TBD): Cursor実装
    // 1. UserNotificationSetting を upsert
    throw new Error('Not implemented');
  }
}
