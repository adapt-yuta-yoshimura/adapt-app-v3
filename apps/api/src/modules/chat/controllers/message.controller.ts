import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { DEFAULT_PAGE_SIZE } from '@adapt/shared';

import {
  MessageService,
  MessageListResponseDto,
  MessageDetailResponseDto,
  SendMessageData,
} from '../services/message.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/services/jwt.service';

/**
 * メッセージコントローラー
 *
 * エンドポイント:
 * - GET    /api/v1/channels/:channelId/messages        - メッセージ一覧
 * - POST   /api/v1/channels/:channelId/messages        - メッセージ送信
 * - PATCH  /api/v1/messages/:messageId                  - メッセージ更新
 * - DELETE /api/v1/messages/:messageId                  - メッセージ削除
 */
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessageController {
  private readonly logger = new Logger(MessageController.name);

  constructor(private readonly messageService: MessageService) {}

  /**
   * GET /api/v1/channels/:channelId/messages
   * チャンネル内のメッセージ一覧を取得する（カーソルベースページネーション）
   */
  @Get('api/v1/channels/:channelId/messages')
  async getMessages(
    @CurrentUser() user: JwtPayload,
    @Param('channelId') channelId: string,
    @Query('limit') limitStr?: string,
    @Query('cursor') cursor?: string,
  ): Promise<MessageListResponseDto> {
    const limit = limitStr ? parseInt(limitStr, 10) : DEFAULT_PAGE_SIZE;
    return this.messageService.getMessages(user.sub, channelId, limit, cursor);
  }

  /**
   * POST /api/v1/channels/:channelId/messages
   * メッセージを送信する
   */
  @Post('api/v1/channels/:channelId/messages')
  async sendMessage(
    @CurrentUser() user: JwtPayload,
    @Param('channelId') channelId: string,
    @Body() dto: SendMessageData,
  ): Promise<MessageDetailResponseDto> {
    return this.messageService.sendMessage(user.sub, channelId, dto);
  }

  /**
   * PATCH /api/v1/messages/:messageId
   * メッセージを更新する（著者本人のみ）
   */
  @Patch('api/v1/messages/:messageId')
  async updateMessage(
    @CurrentUser() user: JwtPayload,
    @Param('messageId') messageId: string,
    @Body() dto: { text: string },
  ): Promise<MessageDetailResponseDto> {
    return this.messageService.updateMessage(user.sub, messageId, dto.text);
  }

  /**
   * DELETE /api/v1/messages/:messageId
   * メッセージを削除する（著者本人または instructor）
   */
  @Delete('api/v1/messages/:messageId')
  async deleteMessage(
    @CurrentUser() user: JwtPayload,
    @Param('messageId') messageId: string,
  ): Promise<{ message: string }> {
    await this.messageService.deleteMessage(user.sub, messageId);
    return { message: 'Message deleted successfully' };
  }
}
