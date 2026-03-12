import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * Submission リポジトリ（受講者用）
 *
 * Submission テーブルへのデータアクセスを隠蔽する。
 * SoT: schema.prisma - Submission model
 */
@Injectable()
export class SubmissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserAndAssignment(userId: string, assignmentId: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async findByUserId(userId: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async create(data: { assignmentId: string; courseId: string; userId: string; threadId: string }) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async countByUser(userId: string) {
    // TODO(TBD): Cursor実装
    // 提出統計用
    throw new Error('Not implemented');
  }
}
