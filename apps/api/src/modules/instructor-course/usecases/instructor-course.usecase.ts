import { Injectable } from '@nestjs/common';

/**
 * 講座管理ユースケース（講師）
 *
 * INS-01チケット: API-025〜031
 * Facade型 UseCase（既存モジュール方針に準拠）
 */
@Injectable()
export class InstructorCourseUseCase {
  constructor(
    // TODO(TBD): Cursor実装 — DI 対象 Repository を注入
    // - CourseRepository
    // - CourseMemberRepository
  ) {}

  /** API-025: 自講座一覧 */
  async listCourses(userId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - courseRepo.findByInstructor(userId)
    // - CourseMember での所属確認
    throw new Error('Not implemented');
  }

  /** API-026: 講座新規作成 */
  async createCourse(userId: string, data: unknown): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - Course 作成（style 必須: one_on_one / seminar / bootcamp）
    // - CourseMember 作成（role=instructor_owner, userId=作成者）
    throw new Error('Not implemented');
  }

  /** API-027: 講座詳細取得(管理) */
  async getCourse(userId: string, courseId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - CourseMember での所属確認（instructor ロール）
    // - Course 取得
    throw new Error('Not implemented');
  }

  /**
   * API-028: 講座情報更新
   * x-policy: 423_ON_FROZEN
   */
  async updateCourse(userId: string, courseId: string, data: unknown): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - 凍結チェック（423_ON_FROZEN）
    // - instructor_owner（CourseMemberRole）確認
    throw new Error('Not implemented');
  }

  /** API-029: 講座削除(論理) */
  async deleteCourse(userId: string, courseId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - instructor_owner（CourseMemberRole）確認
    // - status → archived（論理削除）
    throw new Error('Not implemented');
  }

  /**
   * API-030: 承認申請
   * x-policy: 423_ON_FROZEN
   */
  async requestApproval(userId: string, courseId: string, data: unknown): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - instructor_owner（CourseMemberRole）確認
    // - 凍結チェック（423_ON_FROZEN）
    // - status → pending_approval
    throw new Error('Not implemented');
  }

  /**
   * API-031: コース公開
   * x-policy: AUDIT_LOG
   */
  async publishCourse(userId: string, courseId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - instructor_owner（CourseMemberRole）確認
    // - 承認済み確認（status=approved）
    // - status → active
    // - 403: ownerUserId不一致
    // - AuditEvent 記録（AUDIT_LOG）
    throw new Error('Not implemented');
  }
}
