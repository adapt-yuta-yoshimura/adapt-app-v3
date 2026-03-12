import {
  Controller,
  Get,
  Post,
  Patch,
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
import { MessageUseCase } from './message.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type MessageListResponse =
  paths['/api/v1/channels/{channelId}/messages']['get']['responses']['200']['content']['application/json'];
type PostMessageBody =
  paths['/api/v1/channels/{channelId}/messages']['post']['requestBody']['content']['application/json'];
type PostMessageResponse =
  paths['/api/v1/channels/{channelId}/messages']['post']['responses']['201']['content']['application/json'];
type ThreadDetailResponse =
  paths['/api/v1/messages/{messageId}/thread']['get']['responses']['200']['content']['application/json'];
type ReplyBody =
  paths['/api/v1/messages/{messageId}/replies']['post']['requestBody']['content']['application/json'];
type ReplyResponse =
  paths['/api/v1/messages/{messageId}/replies']['post']['responses']['201']['content']['application/json'];
type EditMessageBody =
  paths['/api/v1/messages/{messageId}']['patch']['requestBody']['content']['application/json'];
type EditMessageResponse =
  paths['/api/v1/messages/{messageId}']['patch']['responses']['200']['content']['application/json'];
type DeleteMessageResponse =
  paths['/api/v1/messages/{messageId}']['delete']['responses']['200']['content']['application/json'];

/**
 * メッセージ管理コントローラ
 *
 * API-053: GET    /api/v1/channels/{channelId}/messages — メッセージ履歴取得
 * API-054: POST   /api/v1/channels/{channelId}/messages — メッセージ投稿
 * API-055: GET    /api/v1/messages/{messageId}/thread — スレッド詳細取得
 * API-056: POST   /api/v1/messages/{messageId}/replies — スレッド返信投稿
 * API-057: PATCH  /api/v1/messages/{messageId} — メッセージ編集
 * API-058: DELETE /api/v1/messages/{messageId} — メッセージ削除
 */
@Controller('api/v1')
@UseGuards(AuthGuard, RolesGuard)
export class MessageController {
  constructor(private readonly usecase: MessageUseCase) {}

  /** API-053: メッセージ履歴取得 */
  @Get('channels/:channelId/messages')
  @Roles('instructor', 'learner')
  async getMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('channelId') channelId: string,
  ): Promise<MessageListResponse> {
    return this.usecase.getMessages(channelId, user.userId);
  }

  /** API-054: メッセージ投稿 */
  @Post('channels/:channelId/messages')
  @Roles('instructor', 'learner')
  async postMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('channelId') channelId: string,
    @Body() body: PostMessageBody,
  ): Promise<PostMessageResponse> {
    return this.usecase.post(channelId, body, user.userId);
  }

  /** API-055: スレッド詳細取得 */
  @Get('messages/:messageId/thread')
  @Roles('instructor', 'learner')
  async getThread(
    @CurrentUser() user: AuthenticatedUser,
    @Param('messageId') messageId: string,
  ): Promise<ThreadDetailResponse> {
    return this.usecase.getThread(messageId, user.userId);
  }

  /** API-056: スレッド返信投稿 */
  @Post('messages/:messageId/replies')
  @Roles('instructor', 'learner')
  async replyToThread(
    @CurrentUser() user: AuthenticatedUser,
    @Param('messageId') messageId: string,
    @Body() body: ReplyBody,
  ): Promise<ReplyResponse> {
    return this.usecase.reply(messageId, body, user.userId);
  }

  /** API-057: メッセージ編集 */
  @Patch('messages/:messageId')
  @Roles('instructor', 'learner')
  async editMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('messageId') messageId: string,
    @Body() body: EditMessageBody,
  ): Promise<EditMessageResponse> {
    return this.usecase.edit(messageId, body, user.userId);
  }

  /** API-058: メッセージ削除 */
  @Delete('messages/:messageId')
  @Roles('instructor', 'learner')
  async deleteMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('messageId') messageId: string,
  ): Promise<DeleteMessageResponse> {
    return this.usecase.delete(messageId, user.userId);
  }
}
