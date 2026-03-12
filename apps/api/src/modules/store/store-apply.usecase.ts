import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { StoreCourseRepository } from './store-course.repository';
import { EnrollmentRepository } from './enrollment.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type ApplyBody =
  paths['/api/v1/store/courses/{courseId}/apply']['post']['requestBody']['content']['application/json'];
type ApplyResponse =
  paths['/api/v1/store/courses/{courseId}/apply']['post']['responses']['201']['content']['application/json'];

/**
 * 講座申込 UseCase
 *
 * API-011: 講座申込(開始)
 */
@Injectable()
export class StoreApplyUseCase {
  constructor(
    private readonly courseRepo: StoreCourseRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}

  /**
   * API-011: 講座申込(開始)
   * x-roles: learner
   * x-policy: Enrollment(pending)
   */
  async applyCourse(courseId: string, userId: string, body: ApplyBody): Promise<ApplyResponse> {
    // TODO(TBD): Cursor実装
    // 1. learner ロール確認（RolesGuard で担保済み）
    // 2. 既存 Enrollment 確認（重複防止）
    // 3. CourseEnrollment 作成（status=applied）
    // 4. 無料講座の場合: status=enrolled に即変更
    // 5. 有料講座の場合: pending のまま → API-012 で決済へ
    throw new Error('Not implemented');
  }
}
