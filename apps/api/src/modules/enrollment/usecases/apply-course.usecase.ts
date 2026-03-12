import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { CourseEnrollmentRepository } from '../repositories/course-enrollment.repository';
import { StoreCourseRepository } from '../../store/repositories/store-course.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type ApplyToCourseResponse =
  paths['/api/v1/store/courses/{courseId}/apply']['post']['responses']['201']['content']['application/json'];

/**
 * 講座申込 UseCase
 *
 * API-011: 講座申込(開始)
 * 新規モジュール → 1 UseCase 1 ファイル原則（CLAUDE.MD §12）
 */
@Injectable()
export class ApplyCourseUseCase {
  constructor(
    private readonly courseEnrollmentRepo: CourseEnrollmentRepository,
    private readonly storeCourseRepo: StoreCourseRepository,
  ) {}

  /**
   * API-011: 講座申込(開始)
   * x-roles: learner
   * x-policy: Enrollment(pending)
   */
  async execute(userId: string, courseId: string): Promise<ApplyToCourseResponse> {
    // TODO(TBD): Cursor実装
    // 1. 講座存在チェック（status=active）→ 404
    // 2. 既存 enrollment チェック → 409 Conflict
    // 3. CourseEnrollment 作成（status=applied, source=stripe）
    // 4. CourseDetailView を返却
    throw new Error('Not implemented');
  }
}
