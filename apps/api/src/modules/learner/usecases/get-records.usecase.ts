import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { LearnerCourseRepository } from '../repositories/learner-course.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type GetRecordsResponse =
  paths['/api/v1/learner/records']['get']['responses']['200']['content']['application/json'];

/**
 * API-020: 学習実績取得 UseCase
 *
 * x-roles: learner, instructor
 * x-policy: '-'
 * ⚠ SoT差分: Response が GenericListResponse
 * ✅ ブロッカー解消: LessonProgress は cbe2f1d で schema.prisma に追加済み
 */
@Injectable()
export class GetRecordsUseCase {
  constructor(
    private readonly learnerCourseRepo: LearnerCourseRepository,
  ) {}

  async execute(userId: string): Promise<GetRecordsResponse> {
    // TODO(TBD): Cursor実装
    // - 修了済み講座: CourseEnrollment（status=active, completedAt IS NOT NULL）→ Course 結合
    // - 学習進捗: LessonProgress（userId, courseId）でレッスン単位の完了率を集計
    // - GenericListResponse（items + meta）への変換
    throw new Error('Not implemented');
  }
}
