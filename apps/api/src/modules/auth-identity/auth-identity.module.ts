import { Module } from '@nestjs/common';
import { UserProfileController } from './user-profile.controller';
import { NotificationController } from './notification.controller';
import { NotificationSettingsController } from './notification-settings.controller';
import { UserProfileUseCase } from './user-profile.usecase';
import { NotificationUseCase } from './notification.usecase';
import { NotificationSettingsUseCase } from './notification-settings.usecase';
import { UserRepository } from './user.repository';
import { UserProfileRepository } from './user-profile.repository';
import { NotificationRepository } from './notification.repository';
import { NotificationSettingsRepository } from './notification-settings.repository';

/**
 * Auth/Identity モジュール（受講者・全ユーザー共通）
 *
 * STU系チケット: API-001〜008
 * - プロフィール取得/更新/パスワード変更
 * - 通知一覧/既読化/一括既読
 * - 通知設定取得/更新
 *
 * PrismaModule / AuthModule は @Global() のため imports 不要
 */
@Module({
  controllers: [
    UserProfileController,
    NotificationController,
    NotificationSettingsController,
  ],
  providers: [
    UserProfileUseCase,
    NotificationUseCase,
    NotificationSettingsUseCase,
    UserRepository,
    UserProfileRepository,
    NotificationRepository,
    NotificationSettingsRepository,
  ],
  exports: [UserRepository],
})
export class AuthIdentityModule {}
