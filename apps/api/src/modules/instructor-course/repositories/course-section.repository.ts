import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * セクションリポジトリ
 *
 * CourseSection テーブルへのデータアクセス
 */
@Injectable()
export class CourseSectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCourseId(courseId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<unknown> {
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
