import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { CurrentUser } from '../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../common/auth/jwt.types';
import { ChannelUseCase } from './channel.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type CourseChannelListResponse =
  paths['/api/v1/courses/{courseId}/channels']['get']['responses']['200']['content']['application/json'];
type ChannelCreateBody =
  paths['/api/v1/courses/{courseId}/channels']['post']['requestBody']['content']['application/json'];
type ChannelCreateResponse =
  paths['/api/v1/courses/{courseId}/channels']['post']['responses']['201']['content']['application/json'];
type ChannelUpdateBody =
  paths['/api/v1/channels/{channelId}']['put']['requestBody']['content']['application/json'];
type ChannelUpdateResponse =
  paths['/api/v1/channels/{channelId}']['put']['responses']['200']['content']['application/json'];
type ChannelDeleteResponse =
  paths['/api/v1/channels/{channelId}']['delete']['responses']['200']['content']['application/json'];

/**
 * チャンネル管理コントローラ
 *
 * API-049: GET    /api/v1/courses/{courseId}/channels — チャンネル一覧取得
 * API-050: POST   /api/v1/courses/{courseId}/channels — チャンネル作成
 * API-051: PUT    /api/v1/channels/{channelId} — チャンネル編集
 * API-052: DELETE /api/v1/channels/{channelId} — チャンネル削除
 */
@Controller('api/v1')
@UseGuards(AuthGuard, RolesGuard)
export class ChannelController {
  constructor(private readonly usecase: ChannelUseCase) {}

  /** API-049: チャンネル一覧取得 */
  @Get('courses/:courseId/channels')
  @Roles('instructor', 'learner')
  async getChannels(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
  ): Promise<CourseChannelListResponse> {
    return this.usecase.getChannels(courseId, user.userId);
  }

  /** API-050: チャンネル作成 */
  @Post('courses/:courseId/channels')
  @Roles('instructor')
  async createChannel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Body() body: ChannelCreateBody,
  ): Promise<ChannelCreateResponse> {
    return this.usecase.create(courseId, body, user.userId);
  }

  /** API-051: チャンネル編集 */
  @Put('channels/:channelId')
  @Roles('instructor')
  async updateChannel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('channelId') channelId: string,
    @Body() body: ChannelUpdateBody,
  ): Promise<ChannelUpdateResponse> {
    return this.usecase.update(channelId, body, user.userId);
  }

  /** API-052: チャンネル削除 */
  @Delete('channels/:channelId')
  @Roles('instructor')
  async deleteChannel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('channelId') channelId: string,
  ): Promise<ChannelDeleteResponse> {
    return this.usecase.delete(channelId, user.userId);
  }
}
