import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { AssignmentRepository } from '../repositories/assignment.repository';
import { SubmissionRepository } from '../repositories/submission.repository';
import { CourseEnrollmentRepository } from '../../enrollment/repositories/course-enrollment.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type AssignmentListResponse =
  paths['/api/v1/learner/assignments']['get']['responses']['200']['content']['application/json'];
type AssignmentDetailView =
  paths['/api/v1/learner/assignments/{lessonId}']['get']['responses']['200']['content']['application/json'];
type SubmitBody =
  paths['/api/v1/learner/lessons/{lessonId}/submissions']['post']['requestBody']['content']['application/json'];
type SubmissionView =
  paths['/api/v1/learner/lessons/{lessonId}/submissions']['post']['responses']['201']['content']['application/json'];

/**
 * 受講者 課題 UseCase
 *
 * API-017: 自分の課題一覧
 * API-018: 課題詳細取得
 * API-019: 課題提出
 */
@Injectable()
export class LearnerAssignmentUseCase {
  constructor(
    private readonly assignmentRepo: AssignmentRepository,
    private readonly submissionRepo: SubmissionRepository,
    private readonly enrollmentRepo: CourseEnrollmentRepository,
  ) {}

  /**
   * API-017: 自分の課題一覧
   * x-roles: learner, instructor
   */
  async getMyAssignments(userId: string): Promise<AssignmentListResponse> {
    // TODO(TBD): Cursor実装
    // 1. 受講中の Course → Assignment 一覧取得
    // 2. 各 Assignment に対して Submission の提出状態を結合
    throw new Error('Not implemented');
  }

  /**
   * API-018: 課題詳細取得
   * x-roles: learner, instructor
   */
  async getAssignmentDetail(lessonId: string, userId: string): Promise<AssignmentDetailView> {
    // TODO(TBD): Cursor実装
    // 1. Lesson 取得 → Assignment 結合
    // 2. Submission 取得（自分の提出状況）
    // 3. GradingComment 取得（採点フィードバック）
    throw new Error('Not implemented');
  }

  /**
   * API-019: 課題提出
   * x-roles: learner, instructor
   * x-policy: 423_ON_FROZEN, threads_only
   */
  async submitAssignment(lessonId: string, userId: string, body: SubmitBody): Promise<SubmissionView> {
    // TODO(TBD): Cursor実装
    // 1. Lesson → Assignment → courseId 特定
    // 2. 凍結チェック（423_ON_FROZEN）→ HttpException(423)
    // 3. Submission 作成（status=submitted）
    // 4. threads_only: CourseThread 作成 + 提出内容をルートメッセージとして紐付け
    // 5. 再提出チェック（allowResubmission）
    throw new Error('Not implemented');
  }
}
