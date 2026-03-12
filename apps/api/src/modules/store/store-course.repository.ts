import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * ストア講座 リポジトリ
 *
 * 公開講座の検索・取得を担当。
 * SoT: schema.prisma - Course, CourseSection, Lesson model
 */
@Injectable()
export class StoreCourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicCourses() {
    // TODO(TBD): Cursor実装
    // Course where status=active, catalogVisibility=public_listed
    throw new Error('Not implemented');
  }

  async findById(courseId: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async findWithSections(courseId: string) {
    // TODO(TBD): Cursor実装
    // Course + CourseSection + Lesson 構造
    throw new Error('Not implemented');
  }
}
