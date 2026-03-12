import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * 受講者講座 リポジトリ
 *
 * Course, CourseSection, Lesson, CourseChannel, LessonProgress テーブルへの
 * データアクセスを隠蔽する。
 * SoT: schema.prisma - Course, CourseSection, Lesson, CourseChannel, LessonProgress model
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

  /**
   * 受講中講座一覧（userId の active enrollment → Course 結合）
   * API-013 用
   */
  async findEnrolledCourses(userId: string) {
    // TODO(TBD): Cursor実装
    // - CourseEnrollment where: { userId, status: 'active' }
    // - include: Course
    // - ページネーション対応
    throw new Error('Not implemented');
  }

  /**
   * 講座詳細（シラバス・チャンネル・統計含む）
   * API-014 用
   */
  async findByIdWithRelations(courseId: string) {
    // TODO(TBD): Cursor実装
    // - where: { id: courseId }
    // - include: CourseChannel[], CourseSection/Lesson, CourseMember（count）, Assignment（count）
    throw new Error('Not implemented');
  }

  /**
   * 修了済み講座一覧
   * API-020 用
   */
  async findCompletedCourses(userId: string) {
    // TODO(TBD): Cursor実装
    // - CourseEnrollment（status=active, completedAt IS NOT NULL）→ Course 結合
    throw new Error('Not implemented');
  }

  /**
   * レッスン進捗一覧（コース単位）
   * API-020 用
   */
  async findLessonProgress(userId: string, courseId: string) {
    // TODO(TBD): Cursor実装
    // - LessonProgress where: { userId, courseId }
    throw new Error('Not implemented');
  }

  /**
   * レッスン進捗の完了率（修了判定用）
   * API-022 用
   */
  async countLessonProgress(userId: string, courseId: string): Promise<{ total: number; completed: number }> {
    // TODO(TBD): Cursor実装
    // - total: Lesson count（courseId）
    // - completed: LessonProgress count（userId, courseId, completedAt IS NOT NULL）
    throw new Error('Not implemented');
  }
}
