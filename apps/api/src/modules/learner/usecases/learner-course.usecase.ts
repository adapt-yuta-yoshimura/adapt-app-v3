import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { LearnerCourseRepository } from '../repositories/learner-course.repository';
import { CourseEnrollmentRepository } from '../../enrollment/repositories/course-enrollment.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type MyCoursesResponse =
  paths['/api/v1/learner/courses']['get']['responses']['200']['content']['application/json'];
type LearnerCourseDetailView =
  paths['/api/v1/learner/courses/{courseId}']['get']['responses']['200']['content']['application/json'];
type SideMenuView =
  paths['/api/v1/learner/courses/{courseId}/side-menu']['get']['responses']['200']['content']['application/json'];
type CompleteBody =
  paths['/api/v1/learner/courses/{courseId}/complete']['post']['requestBody']['content']['application/json'];
type CompleteResponse =
  paths['/api/v1/learner/courses/{courseId}/complete']['post']['responses']['201']['content']['application/json'];

/**
 * 受講者講座 UseCase
 *
 * API-013: マイ講座一覧
 * API-014: 受講中講座詳細
 * API-016: サイドメニュー取得
 * API-022: コース修了処理
 */
@Injectable()
export class LearnerCourseUseCase {
  constructor(
    private readonly courseRepo: LearnerCourseRepository,
    private readonly enrollmentRepo: CourseEnrollmentRepository,
  ) {}

  /**
   * API-013: マイ講座一覧
   * x-roles: learner, instructor
   */
  async getMyCourses(userId: string): Promise<MyCoursesResponse> {
    // TODO(TBD): Cursor実装
    // 1. CourseEnrollment where userId, status ∈ [enrolled, completed]
    // 2. Course 情報を結合
    throw new Error('Not implemented');
  }

  /**
   * API-014: 受講中講座詳細
   * x-roles: learner, instructor
   * x-policy: 423_ON_FROZEN
   */
  async getCourseDetail(courseId: string, userId: string): Promise<LearnerCourseDetailView> {
    // TODO(TBD): Cursor実装
    // 1. CourseEnrollment 確認（受講中であること）
    // 2. 凍結チェック（423_ON_FROZEN）→ HttpException(423)
    // 3. Course + Section + Lesson 構造取得
    // 4. 進捗情報（Submission ステータス等）を結合
    throw new Error('Not implemented');
  }

  /**
   * API-016: サイドメニュー取得
   * x-roles: learner, instructor
   */
  async getSideMenu(courseId: string, userId: string): Promise<SideMenuView> {
    // TODO(TBD): Cursor実装
    // 1. CourseEnrollment 確認
    // 2. CourseSection + Lesson 構造取得（ナビゲーション用）
    // 3. 各レッスンの完了状態を結合
    throw new Error('Not implemented');
  }

  /**
   * API-022: コース修了処理
   * x-roles: learner, instructor
   */
  async completeCourse(courseId: string, userId: string, body: CompleteBody): Promise<CompleteResponse> {
    // TODO(TBD): Cursor実装
    // 1. CourseEnrollment 確認
    // 2. 全レッスン完了チェック（必要な場合）
    // 3. status を completed に更新
    // 4. completedAt 記録
    throw new Error('Not implemented');
  }
}
