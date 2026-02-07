import { Injectable } from '@nestjs/common';
import { CourseThread, CourseThreadType } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

/** スレッド作成データ */
export interface CreateThreadData {
  channelId: string;
  rootMessageId?: string;
  type?: CourseThreadType;
}

/**
 * スレッドリポジトリ
 * @see schema.prisma - CourseThread
 */
@Injectable()
export class ThreadRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * IDでスレッドを取得する
   */
  async findById(id: string): Promise<CourseThread | null> {
    return this.prisma.courseThread.findUnique({
      where: { id },
    });
  }

  /**
   * チャンネルIDでスレッド一覧を取得する
   */
  async findByChannel(channelId: string): Promise<CourseThread[]> {
    return this.prisma.courseThread.findMany({
      where: { channelId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * ルートメッセージIDでスレッドを取得する
   */
  async findByRootMessage(rootMessageId: string): Promise<CourseThread | null> {
    return this.prisma.courseThread.findUnique({
      where: { rootMessageId },
    });
  }

  /**
   * スレッドを新規作成する
   */
  async create(data: CreateThreadData): Promise<CourseThread> {
    return this.prisma.courseThread.create({
      data: {
        channelId: data.channelId,
        rootMessageId: data.rootMessageId,
        type: data.type ?? 'message_thread',
      },
    });
  }

  /**
   * スレッド内のメッセージ件数を取得する
   */
  async countMessages(threadId: string): Promise<number> {
    return this.prisma.courseMessage.count({
      where: { threadId },
    });
  }
}
