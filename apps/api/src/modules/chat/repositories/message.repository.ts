import { Injectable } from '@nestjs/common';
import { CourseMessage } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

/** メッセージ作成データ */
export interface CreateMessageData {
  channelId: string;
  threadId?: string;
  authorCourseMemberId: string;
  text: string;
  isEmergency?: boolean;
}

/**
 * メッセージリポジトリ
 * @see schema.prisma - CourseMessage
 */
@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * IDでメッセージを取得する
   */
  async findById(id: string): Promise<CourseMessage | null> {
    return this.prisma.courseMessage.findUnique({
      where: { id },
    });
  }

  /**
   * チャンネルIDでメッセージ一覧を取得する（カーソルベースページネーション）
   * @param channelId チャンネルID
   * @param limit 取得件数
   * @param cursor カーソル（メッセージID）
   */
  async findByChannel(
    channelId: string,
    limit: number,
    cursor?: string,
  ): Promise<CourseMessage[]> {
    return this.prisma.courseMessage.findMany({
      where: {
        channelId,
        threadId: null, // ルートメッセージのみ（スレッド返信除外）
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
    });
  }

  /**
   * スレッドIDでメッセージ一覧を取得する
   * @param threadId スレッドID
   */
  async findByThread(threadId: string): Promise<CourseMessage[]> {
    return this.prisma.courseMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * メッセージを新規作成する
   */
  async create(data: CreateMessageData): Promise<CourseMessage> {
    return this.prisma.courseMessage.create({
      data: {
        channelId: data.channelId,
        threadId: data.threadId,
        authorCourseMemberId: data.authorCourseMemberId,
        text: data.text,
        isEmergency: data.isEmergency ?? false,
      },
    });
  }

  /**
   * メッセージテキストを更新する
   */
  async update(id: string, text: string): Promise<CourseMessage> {
    return this.prisma.courseMessage.update({
      where: { id },
      data: { text },
    });
  }

  /**
   * チャンネル内のメッセージ件数を取得する
   */
  async countByChannel(channelId: string): Promise<number> {
    return this.prisma.courseMessage.count({
      where: { channelId },
    });
  }
}
