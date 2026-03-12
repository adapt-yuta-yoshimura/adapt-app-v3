import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { LearnerCourseRepository } from '../repositories/learner-course.repository';
import { LearnerEnrollmentRepository } from '../repositories/learner-enrollment.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type CompleteCourseResponse =
  paths['/api/v1/learner/courses/{courseId}/complete']['post']['responses']['201']['content']['application/json'];

/**
 * API-022: コース修了処理 UseCase
 *
 * x-roles: learner, instructor
 * x-policy: '-'
 * ✅ ブロッカー解消: CourseEnrollment.completedAt で修了表現（cbe2f1d）
 *
 * CourseDetailView:
 *   course: Course
 *   channels: CourseChannelSummaryView[]
 *   stats: CourseStatsView
 */
@Injectable()
export class CompleteCourseUseCase {
  constructor(
    private readonly learnerCourseRepo: LearnerCourseRepository,
    private readonly learnerEnrollmentRepo: LearnerEnrollmentRepository,
  ) {}

  async execute(userId: string, courseId: string): Promise<CompleteCourseResponse> {
    // TODO(TBD): Cursor実装
    // 1. enrolled 確認 → 404（未受講 or 不存在）
    // 2. 修了判定ロジック
    //    - BC: LessonProgress で全レッスン完了を確認
    //      - learnerCourseRepo.countLessonProgress(userId, courseId)
    //      - total === completed であること
    //    - 1on1/セミナー: レッスン構造なし → enrolled であれば修了可
    // 3. CourseEnrollment.completedAt = now() で修了記録
    //    - status は active のまま（enum 変更なし）
    // 4. CourseDetailView を返却
    throw new Error('Not implemented');
  }
}
