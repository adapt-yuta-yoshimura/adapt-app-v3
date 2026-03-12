import { Injectable } from '@nestjs/common';
import type { CourseMessage } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findRootByChannelId(channelId: string): Promise<CourseMessage[]> {
    // TODO(TBD): Cursor実装 — threadId = null のルートメッセージのみ取得
    // author 情報（CourseMember）の結合
    throw new Error('Not implemented');
  }

  async findById(messageId: string): Promise<CourseMessage | null> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async findByThreadId(threadId: string): Promise<CourseMessage[]> {
    // TODO(TBD): Cursor実装 — スレッド配下の返信メッセージ一覧
    throw new Error('Not implemented');
  }

  async create(params: {
    channelId: string;
    threadId?: string | null;
    authorCourseMemberId: string;
    text: string;
    isEmergency?: boolean;
  }): Promise<CourseMessage> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async updateText(messageId: string, text: string): Promise<CourseMessage> {
    // TODO(TBD): Cursor実装
    // NOTE: 編集履歴保持の具体的な実装方式は schema.prisma 未定義（TBD）
    throw new Error('Not implemented');
  }

  async softDelete(messageId: string): Promise<CourseMessage> {
    // TODO(TBD): Cursor実装 — 論理削除（返信がある場合は「削除されました」表示）
    throw new Error('Not implemented');
  }
}
