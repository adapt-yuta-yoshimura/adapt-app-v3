import { Module } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { CourseModule } from '../course/course.module';

// Controllers
import { ChannelController } from './controllers/channel.controller';
import { MessageController } from './controllers/message.controller';

// Services
import { ChannelService } from './services/channel.service';
import { MessageService } from './services/message.service';

// Repositories
import { ChannelRepository } from './repositories/channel.repository';
import { MessageRepository } from './repositories/message.repository';
import { ThreadRepository } from './repositories/thread.repository';

// Gateways
import { ChatGateway } from './gateways/chat.gateway';

/**
 * チャットモジュール
 *
 * 提供する機能:
 * - リアルタイムメッセージング（Socket.IO WebSocket）
 * - チャンネル管理（CRUD）
 * - メッセージ管理（送信・更新・削除）
 * - スレッド管理
 *
 * WebSocket namespace: /chat
 *
 * エクスポート:
 * - ChannelService: 他モジュールでチャンネル操作に使用
 * - MessageService: 他モジュールでメッセージ操作に使用
 */
@Module({
  imports: [AuthModule, CourseModule],
  controllers: [ChannelController, MessageController],
  providers: [
    PrismaService,
    // Services
    ChannelService,
    MessageService,
    // Repositories
    ChannelRepository,
    MessageRepository,
    ThreadRepository,
    // Gateways
    ChatGateway,
  ],
  exports: [ChannelService, MessageService],
})
export class ChatModule {}
