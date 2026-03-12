import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { LearnerCourseRepository } from '../repositories/learner-course.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type GetMyCoursesResponse =
  paths['/api/v1/learner/courses']['get']['responses']['200']['content']['application/json'];

/**
 * API-013: マイ講座一覧 UseCase
 *
 * x-roles: learner, instructor
 * x-policy: '-'
 * ⚠ SoT差分: Response が GenericListResponse（items: object[]）
 */
@Injectable()
export class GetMyCoursesUseCase {
  constructor(
    private readonly learnerCourseRepo: LearnerCourseRepository,
  ) {}

  async execute(userId: string): Promise<GetMyCoursesResponse> {
    // TODO(TBD): Cursor実装
    // - learnerCourseRepo.findEnrolledCourses(userId)
    // - CourseEnrollment（status=active）→ Course 結合
    // - GenericListResponse（items + meta）への変換
    throw new Error('Not implemented');
  }
}
