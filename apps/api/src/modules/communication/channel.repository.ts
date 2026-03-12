import { Injectable } from '@nestjs/common';
import type { CourseChannel } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ChannelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCourseId(courseId: string): Promise<CourseChannel[]> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async findById(channelId: string): Promise<CourseChannel | null> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async create(params: {
    courseId: string;
    name: string;
    isManual: boolean;
  }): Promise<CourseChannel> {
    // TODO(TBD): Cursor実装 — CourseChannelCreateRequest のフィールドに基づく
    throw new Error('Not implemented');
  }

  async update(
    channelId: string,
    params: { name?: string; visibility?: string },
  ): Promise<CourseChannel> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async delete(channelId: string): Promise<CourseChannel> {
    // TODO(TBD): Cursor実装 — 論理削除（過去ログ監査用に保持）
    throw new Error('Not implemented');
  }
}
