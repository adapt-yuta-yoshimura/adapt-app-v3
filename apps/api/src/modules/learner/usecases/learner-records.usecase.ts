import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { CourseEnrollmentRepository } from '../../enrollment/repositories/course-enrollment.repository';
import { SubmissionRepository } from '../repositories/submission.repository';
import { LearnerCourseRepository } from '../repositories/learner-course.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type RecordsResponse =
  paths['/api/v1/learner/records']['get']['responses']['200']['content']['application/json'];
type CalendarResponse =
  paths['/api/v1/learner/calendar']['get']['responses']['200']['content']['application/json'];

/**
 * 受講者 学習実績・カレンダー UseCase
 *
 * API-020: 学習実績取得
 * API-021: カレンダー取得
 */
@Injectable()
export class LearnerRecordsUseCase {
  constructor(
    private readonly enrollmentRepo: CourseEnrollmentRepository,
    private readonly submissionRepo: SubmissionRepository,
    private readonly courseRepo: LearnerCourseRepository,
  ) {}

  /**
   * API-020: 学習実績取得
   * x-roles: learner, instructor
   */
  async getRecords(userId: string): Promise<RecordsResponse> {
    // TODO(TBD): Cursor実装
    // 1. CourseEnrollment（status=completed）取得
    // 2. Submission 統計（提出数、合格数）結合
    throw new Error('Not implemented');
  }

  /**
   * API-021: カレンダー取得
   * x-roles: learner, instructor
   */
  async getCalendar(userId: string): Promise<CalendarResponse> {
    // TODO(TBD): Cursor実装
    // 1. 受講中の Course → Lesson（type=live）のスケジュール取得
    // 2. 日付順にソート
    throw new Error('Not implemented');
  }
}
