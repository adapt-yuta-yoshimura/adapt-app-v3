import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Enrollment リポジトリ
 *
 * CourseEnrollment テーブルへのデータアクセスを隠蔽する。
 * SoT: schema.prisma - CourseEnrollment model
 * @@unique([courseId, userId])
 */
@Injectable()
export class EnrollmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCourseAndUser(courseId: string, userId: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async findByUserId(userId: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async findById(id: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async create(data: { courseId: string; userId: string; status: string; source: string }) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }
}
