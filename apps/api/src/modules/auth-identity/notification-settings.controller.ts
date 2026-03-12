import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../common/auth/jwt.types';
import { NotificationSettingsUseCase } from './notification-settings.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type NotificationSettingView =
  paths['/api/v1/users/me/settings/notifications']['get']['responses']['200']['content']['application/json'];
type NotificationSettingUpdateBody =
  paths['/api/v1/users/me/settings/notifications']['put']['requestBody']['content']['application/json'];
type NotificationSettingUpdateResponse =
  paths['/api/v1/users/me/settings/notifications']['put']['responses']['200']['content']['application/json'];

/**
 * 通知設定コントローラ
 *
 * API-007: 通知設定取得
 * API-008: 通知設定更新
 * SoT: openapi_app.yaml
 */
@Controller('api/v1/users/me/settings')
@UseGuards(AuthGuard, RolesGuard)
export class NotificationSettingsController {
  constructor(private readonly usecase: NotificationSettingsUseCase) {}

  /**
   * API-007: 通知設定取得
   * GET /api/v1/users/me/settings/notifications
   * x-roles: all
   */
  @Get('notifications')
  async getSettings(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationSettingView> {
    return this.usecase.getSettings(user.userId);
  }

  /**
   * API-008: 通知設定更新
   * PUT /api/v1/users/me/settings/notifications
   * x-roles: all
   */
  @Put('notifications')
  async updateSettings(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: NotificationSettingUpdateBody,
  ): Promise<NotificationSettingUpdateResponse> {
    return this.usecase.updateSettings(user.userId, body);
  }
}
