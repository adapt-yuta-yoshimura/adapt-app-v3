import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * 受講者講座 リポジトリ
 *
 * Course, CourseSection, Lesson テーブルへのデータアクセスを隠蔽する。
 * SoT: schema.prisma - Course, CourseSection, Lesson model
 */
@Injectable()
export class LearnerCourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(courseId: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async findWithSectionsAndLessons(courseId: string) {
    // TODO(TBD): Cursor実装
    // Course + CourseSection + Lesson 構造
    throw new Error('Not implemented');
  }

  async findLiveLessonsByUser(userId: string) {
    // TODO(TBD): Cursor実装
    // 受講中 Course → Lesson(type=live) のスケジュール取得
    throw new Error('Not implemented');
  }
}
