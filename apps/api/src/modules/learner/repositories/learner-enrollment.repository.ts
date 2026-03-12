import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * 受講者 Enrollment リポジトリ
 *
 * CourseEnrollment, Order, Payment テーブルへのデータアクセスを隠蔽する。
 * SoT: schema.prisma - CourseEnrollment, Order, Payment model
 *
 * ※ enrollment モジュールの CourseEnrollmentRepository とは別。
 *   learner ドメイン固有のクエリ（受講者視点での結合取得）を提供する。
 */
@Injectable()
export class LearnerEnrollmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * userId + courseId で enrollment 取得
   * @@unique([courseId, userId]) を利用
   */
  async findByUserAndCourse(userId: string, courseId: string) {
    // TODO(TBD): Cursor実装
    // - CourseEnrollment where: { courseId, userId }
    // - @@unique([courseId, userId]) を利用
    throw new Error('Not implemented');
  }

  /**
   * enrollmentId で取得
   */
  async findById(enrollmentId: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  /**
   * enrollment + Order/Payment 結合取得（API-015 用）
   */
  async findByIdWithPayment(enrollmentId: string) {
    // TODO(TBD): Cursor実装
    // - CourseEnrollment.paymentId → Payment 結合
    // - Order（courseId + userId）結合
    throw new Error('Not implemented');
  }

  /**
   * 修了記録（API-022 用）
   * CourseEnrollment.completedAt = now()
   * status は active のまま維持
   */
  async markCompleted(userId: string, courseId: string) {
    // TODO(TBD): Cursor実装
    // - CourseEnrollment where: { courseId_userId: { courseId, userId } }
    // - update: { completedAt: new Date() }
    throw new Error('Not implemented');
  }
}
