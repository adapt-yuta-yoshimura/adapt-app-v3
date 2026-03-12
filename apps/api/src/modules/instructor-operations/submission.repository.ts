import { Injectable } from '@nestjs/common';
import type { Submission, SubmissionStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SubmissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCourseId(courseId: string): Promise<Submission[]> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async findById(submissionId: string): Promise<Submission | null> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async updateStatus(
    submissionId: string,
    status: SubmissionStatus,
    gradedAt: Date | null,
  ): Promise<Submission> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }
}
