import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../common/auth/jwt.types';
import { NotificationUseCase } from './notification.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type NotificationListResponse =
  paths['/api/v1/notifications']['get']['responses']['200']['content']['application/json'];
type MarkReadBody =
  paths['/api/v1/notifications/{notificationId}/read']['post']['requestBody']['content']['application/json'];
type MarkReadResponse =
  paths['/api/v1/notifications/{notificationId}/read']['post']['responses']['201']['content']['application/json'];
type MarkAllReadBody =
  paths['/api/v1/notifications/read-all']['post']['requestBody']['content']['application/json'];
type MarkAllReadResponse =
  paths['/api/v1/notifications/read-all']['post']['responses']['201']['content']['application/json'];

/**
 * 通知コントローラ
 *
 * API-004: 通知一覧取得
 * API-005: 通知既読化
 * API-006: 通知一括既読
 * SoT: openapi_app.yaml
 */
@Controller('api/v1/notifications')
@UseGuards(AuthGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly usecase: NotificationUseCase) {}

  /**
   * API-004: 通知一覧取得
   * GET /api/v1/notifications
   * x-roles: all
   */
  @Get()
  async getNotifications(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationListResponse> {
    return this.usecase.getNotifications(user.userId);
  }

  /**
   * API-005: 通知既読化
   * POST /api/v1/notifications/:notificationId/read
   * x-roles: all
   */
  @Post(':notificationId/read')
  async markAsRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('notificationId') notificationId: string,
    @Body() _body: MarkReadBody,
  ): Promise<MarkReadResponse> {
    return this.usecase.markAsRead(notificationId, user.userId);
  }

  /**
   * API-006: 通知一括既読
   * POST /api/v1/notifications/read-all
   * x-roles: all
   */
  @Post('read-all')
  async markAllAsRead(
    @CurrentUser() user: AuthenticatedUser,
    @Body() _body: MarkAllReadBody,
  ): Promise<MarkAllReadResponse> {
    return this.usecase.markAllAsRead(user.userId);
  }
}
