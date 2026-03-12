import { Injectable } from '@nestjs/common';
import type { CourseEnrollment, PaymentProvider } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * CourseEnrollment リポジトリ
 *
 * CourseEnrollment テーブルへのデータアクセスを隠蔽する。
 * SoT: schema.prisma - CourseEnrollment model
 * @@unique([courseId, userId])
 */
@Injectable()
export class CourseEnrollmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserAndCourse(userId: string, courseId: string): Promise<CourseEnrollment | null> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async create(data: {
    userId: string;
    courseId: string;
    source: PaymentProvider;
  }): Promise<CourseEnrollment> {
    // TODO(TBD): Cursor実装
    // - status: 'applied'（デフォルト）
    // - unique 制約違反時の 409 ハンドリング
    throw new Error('Not implemented');
  }
}
