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
  ForbiddenException,
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
import { ValidatedUser } from '../../auth/strategies/jwt.strategy';
import { AuthService } from '../../auth/services/auth.service';

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

  constructor(
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
  ) {}

  /**
   * GET /api/v1/channels/:channelId/messages
   * チャンネル内のメッセージ一覧を取得する（カーソルベースページネーション）
   */
  @Get('api/v1/channels/:channelId/messages')
  async getMessages(
    @CurrentUser() user: ValidatedUser,
    @Param('channelId') channelId: string,
    @Query('limit') limitStr?: string,
    @Query('cursor') cursor?: string,
  ): Promise<MessageListResponseDto> {
    const dbUser = await this.authService.syncUser(user);
    if (!dbUser) {
      throw new ForbiddenException('User not provisioned');
    }
    const limit = limitStr ? parseInt(limitStr, 10) : DEFAULT_PAGE_SIZE;
    return this.messageService.getMessages(dbUser.id, channelId, limit, cursor);
  }

  /**
   * POST /api/v1/channels/:channelId/messages
   * メッセージを送信する
   */
  @Post('api/v1/channels/:channelId/messages')
  async sendMessage(
    @CurrentUser() user: ValidatedUser,
    @Param('channelId') channelId: string,
    @Body() dto: SendMessageData,
  ): Promise<MessageDetailResponseDto> {
    const dbUser = await this.authService.syncUser(user);
    if (!dbUser) {
      throw new ForbiddenException('User not provisioned');
    }
    return this.messageService.sendMessage(dbUser.id, channelId, dto);
  }

  /**
   * PATCH /api/v1/messages/:messageId
   * メッセージを更新する（著者本人のみ）
   */
  @Patch('api/v1/messages/:messageId')
  async updateMessage(
    @CurrentUser() user: ValidatedUser,
    @Param('messageId') messageId: string,
    @Body() dto: { text: string },
  ): Promise<MessageDetailResponseDto> {
    const dbUser = await this.authService.syncUser(user);
    if (!dbUser) {
      throw new ForbiddenException('User not provisioned');
    }
    return this.messageService.updateMessage(dbUser.id, messageId, dto.text);
  }

  /**
   * DELETE /api/v1/messages/:messageId
   * メッセージを削除する（著者本人または instructor）
   */
  @Delete('api/v1/messages/:messageId')
  async deleteMessage(
    @CurrentUser() user: ValidatedUser,
    @Param('messageId') messageId: string,
  ): Promise<{ message: string }> {
    const dbUser = await this.authService.syncUser(user);
    if (!dbUser) {
      throw new ForbiddenException('User not provisioned');
    }
    await this.messageService.deleteMessage(dbUser.id, messageId);
    return { message: 'Message deleted successfully' };
  }
}
