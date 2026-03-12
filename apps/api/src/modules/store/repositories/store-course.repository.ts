import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * ストア講座 リポジトリ
 *
 * 公開講座の検索・取得を担当。
 * SoT: schema.prisma - Course, CourseSection, Lesson model
 */
@Injectable()
export class StoreCourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ストア公開講座一覧（status=active, catalogVisibility=public_listed）
   */
  async findActivePublic(/* filters, pagination */): Promise<unknown[]> {
    // TODO(TBD): Cursor実装
    // - where: { status: 'active', catalogVisibility: 'public_listed' }
    // - include: _count { members, channels }
    // - style フィルター、keyword 検索
    // - ページネーション
    throw new Error('Not implemented');
  }

  /**
   * 公開講座詳細（ID指定）
   */
  async findPublicById(courseId: string): Promise<unknown | null> {
    // TODO(TBD): Cursor実装
    // - where: { id: courseId, status: 'active' }
    // - include: User（講師情報）, CourseSection/Lesson（BC用シラバス）
    throw new Error('Not implemented');
  }
}
