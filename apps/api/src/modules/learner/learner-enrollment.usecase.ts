import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { EnrollmentRepository } from '../store/enrollment.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type EnrollmentDetailView =
  paths['/api/v1/learner/enrollments/{enrollmentId}']['get']['responses']['200']['content']['application/json'];

/**
 * 受講者 Enrollment UseCase
 *
 * API-015: 決済/申込状況確認
 */
@Injectable()
export class LearnerEnrollmentUseCase {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}

  /**
   * API-015: 決済/申込状況確認
   * x-roles: learner, instructor
   */
  async getEnrollmentStatus(enrollmentId: string, userId: string): Promise<EnrollmentDetailView> {
    // TODO(TBD): Cursor実装
    // 1. CourseEnrollment 取得 → userId 一致確認
    // 2. Payment 情報結合（支払い状況）
    throw new Error('Not implemented');
  }
}
