import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * 講座リポジトリ（講師向け）
 *
 * 注意: admin-course モジュールにも CourseRepository が存在する。
 * 将来的に共通 Repository への統合を検討すること。
 * 現時点では instructor 固有のクエリパターンを分離するため独立。
 */
@Injectable()
export class CourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByInstructor(userId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - CourseMember 経由で instructor が所属する講座を取得
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

  async archive(id: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - 論理削除（status → archived）
    throw new Error('Not implemented');
  }
}
