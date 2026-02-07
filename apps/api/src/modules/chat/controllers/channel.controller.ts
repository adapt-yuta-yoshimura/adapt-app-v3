import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Logger,
  ForbiddenException,
} from '@nestjs/common';

import { ChannelService, ChannelListResponseDto, ChannelDetailResponseDto } from '../services/channel.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ValidatedUser } from '../../auth/strategies/jwt.strategy';
import { AuthService } from '../../auth/services/auth.service';
import { CreateChannelData, UpdateChannelData } from '../repositories/channel.repository';

/**
 * チャンネルコントローラー
 *
 * エンドポイント:
 * - GET    /api/v1/courses/:courseId/channels          - チャンネル一覧
 * - POST   /api/v1/courses/:courseId/channels          - チャンネル作成
 * - PUT    /api/v1/channels/:channelId                 - チャンネル更新
 * - DELETE /api/v1/channels/:channelId                 - チャンネル削除
 */
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChannelController {
  private readonly logger = new Logger(ChannelController.name);

  constructor(
    private readonly channelService: ChannelService,
    private readonly authService: AuthService,
  ) {}

  /**
   * GET /api/v1/courses/:courseId/channels
   * コース内のチャンネル一覧を取得する
   */
  @Get('api/v1/courses/:courseId/channels')
  async getChannels(
    @CurrentUser() user: ValidatedUser,
    @Param('courseId') courseId: string,
  ): Promise<ChannelListResponseDto> {
    const dbUser = await this.authService.syncUser(user);
    if (!dbUser) {
      throw new ForbiddenException('User not provisioned');
    }
    return this.channelService.getChannels(dbUser.id, courseId);
  }

  /**
   * POST /api/v1/courses/:courseId/channels
   * チャンネルを新規作成する
   */
  @Post('api/v1/courses/:courseId/channels')
  async createChannel(
    @CurrentUser() user: ValidatedUser,
    @Param('courseId') courseId: string,
    @Body() dto: Omit<CreateChannelData, 'courseId'>,
  ): Promise<ChannelDetailResponseDto> {
    const dbUser = await this.authService.syncUser(user);
    if (!dbUser) {
      throw new ForbiddenException('User not provisioned');
    }
    return this.channelService.createChannel(dbUser.id, courseId, dto);
  }

  /**
   * PUT /api/v1/channels/:channelId
   * チャンネル情報を更新する
   */
  @Put('api/v1/channels/:channelId')
  async updateChannel(
    @CurrentUser() user: ValidatedUser,
    @Param('channelId') channelId: string,
    @Body() dto: UpdateChannelData,
  ): Promise<ChannelDetailResponseDto> {
    const dbUser = await this.authService.syncUser(user);
    if (!dbUser) {
      throw new ForbiddenException('User not provisioned');
    }
    return this.channelService.updateChannel(dbUser.id, channelId, dto);
  }

  /**
   * DELETE /api/v1/channels/:channelId
   * チャンネルを削除する（論理削除）
   */
  @Delete('api/v1/channels/:channelId')
  async deleteChannel(
    @CurrentUser() user: ValidatedUser,
    @Param('channelId') channelId: string,
  ): Promise<{ message: string }> {
    const dbUser = await this.authService.syncUser(user);
    if (!dbUser) {
      throw new ForbiddenException('User not provisioned');
    }
    await this.channelService.deleteChannel(dbUser.id, channelId);
    return { message: 'Channel deleted successfully' };
  }
}
