import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { SubmissionRepository } from './submission.repository';
import { CourseMemberRepository } from '../instructor-course/repositories/course-member.repository';
import { MessageRepository } from '../communication/message.repository';
import { ThreadRepository } from '../communication/thread.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type SubmissionListResponse =
  paths['/api/v1/instructor/courses/{courseId}/submissions']['get']['responses']['200']['content']['application/json'];
type SubmissionView =
  paths['/api/v1/instructor/submissions/{submissionId}/evaluation']['patch']['responses']['200']['content']['application/json'];
type EvaluationBody =
  paths['/api/v1/instructor/submissions/{submissionId}/evaluation']['patch']['requestBody']['content']['application/json'];

/**
 * 提出物管理 UseCase（講師向け）
 *
 * API-043: 提出一覧取得
 * API-044: 評価・採点実行
 */
@Injectable()
export class InstructorSubmissionUseCase {
  constructor(
    private readonly submissionRepo: SubmissionRepository,
    private readonly memberRepo: CourseMemberRepository,
    private readonly messageRepo: MessageRepository,
    private readonly threadRepo: ThreadRepository,
  ) {}

  /**
   * API-043: 提出一覧取得
   * x-roles: instructor
   */
  async getSubmissions(
    courseId: string,
    userId: string,
  ): Promise<SubmissionListResponse> {
    // TODO(TBD): Cursor実装
    // 1. CourseMember で instructor 権限確認
    // 2. Submission を courseId でフィルタ取得
    // 3. 各 Submission に対して User 情報（受講者名）を結合
    throw new Error('Not implemented');
  }

  /**
   * API-044: 評価・採点実行
   * x-roles: instructor, assistant
   * x-policy: THREAD_REPLY(AUTO)
   */
  async evaluate(
    submissionId: string,
    body: EvaluationBody,
    userId: string,
  ): Promise<SubmissionView> {
    // TODO(TBD): Cursor実装
    // 1. Submission 取得 → courseId 特定
    // 2. CourseMember で instructor or assistant 権限確認
    // 3. status 更新、gradedAt 記録
    // 4. x-policy: THREAD_REPLY(AUTO) → フィードバックを threadId のスレッドに自動投稿
    //    - CourseMessage を作成し、Submission.threadId に紐付け
    throw new Error('Not implemented');
  }
}
