import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * レッスンリポジトリ
 *
 * Lesson テーブルへのデータアクセス
 */
@Injectable()
export class LessonRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async findBySectionId(sectionId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async create(data: unknown): Promise<unknown> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async update(id: string, data: unknown): Promise<unknown> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }
}
