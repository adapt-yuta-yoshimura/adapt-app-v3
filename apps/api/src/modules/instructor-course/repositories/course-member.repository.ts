import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * コースメンバーリポジトリ（講師向け）
 *
 * 注意: admin-course モジュールにも CourseMemberRepository が存在する。
 * 将来的に共通 Repository への統合を検討すること。
 * 現時点では instructor 固有のクエリパターンを分離するため独立。
 */
@Injectable()
export class CourseMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserAndCourse(userId: string, courseId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - CourseMember の role 確認用
    throw new Error('Not implemented');
  }

  async create(data: unknown): Promise<unknown> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }
}
