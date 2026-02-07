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
} from '@nestjs/common';

import { ChannelService, ChannelListResponseDto, ChannelDetailResponseDto } from '../services/channel.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/services/jwt.service';
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

  constructor(private readonly channelService: ChannelService) {}

  /**
   * GET /api/v1/courses/:courseId/channels
   * コース内のチャンネル一覧を取得する
   */
  @Get('api/v1/courses/:courseId/channels')
  async getChannels(
    @CurrentUser() user: JwtPayload,
    @Param('courseId') courseId: string,
  ): Promise<ChannelListResponseDto> {
    return this.channelService.getChannels(user.sub, courseId);
  }

  /**
   * POST /api/v1/courses/:courseId/channels
   * チャンネルを新規作成する
   */
  @Post('api/v1/courses/:courseId/channels')
  async createChannel(
    @CurrentUser() user: JwtPayload,
    @Param('courseId') courseId: string,
    @Body() dto: Omit<CreateChannelData, 'courseId'>,
  ): Promise<ChannelDetailResponseDto> {
    return this.channelService.createChannel(user.sub, courseId, dto);
  }

  /**
   * PUT /api/v1/channels/:channelId
   * チャンネル情報を更新する
   */
  @Put('api/v1/channels/:channelId')
  async updateChannel(
    @CurrentUser() user: JwtPayload,
    @Param('channelId') channelId: string,
    @Body() dto: UpdateChannelData,
  ): Promise<ChannelDetailResponseDto> {
    return this.channelService.updateChannel(user.sub, channelId, dto);
  }

  /**
   * DELETE /api/v1/channels/:channelId
   * チャンネルを削除する（論理削除）
   */
  @Delete('api/v1/channels/:channelId')
  async deleteChannel(
    @CurrentUser() user: JwtPayload,
    @Param('channelId') channelId: string,
  ): Promise<{ message: string }> {
    await this.channelService.deleteChannel(user.sub, channelId);
    return { message: 'Channel deleted successfully' };
  }
}
