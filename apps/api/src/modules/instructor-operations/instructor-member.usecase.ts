import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { CourseMemberOpsRepository } from './course-member-ops.repository';
import { CourseMemberRepository } from '../instructor-course/repositories/course-member.repository';
import { CourseRepository } from '../instructor-course/repositories/course.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type MemberListResponse =
  paths['/api/v1/instructor/courses/{courseId}/members']['get']['responses']['200']['content']['application/json'];
type RoleChangeResponse =
  paths['/api/v1/instructor/courses/{courseId}/members/{userId}/role']['patch']['responses']['200']['content']['application/json'];
type RoleChangeBody =
  paths['/api/v1/instructor/courses/{courseId}/members/{userId}/role']['patch']['requestBody']['content']['application/json'];
type RevokeResponse =
  paths['/api/v1/instructor/courses/{courseId}/members/{userId}/revoke']['post']['responses']['201']['content']['application/json'];
type RevokeBody =
  paths['/api/v1/instructor/courses/{courseId}/members/{userId}/revoke']['post']['requestBody']['content']['application/json'];
type ExportResponse =
  paths['/api/v1/instructor/courses/{courseId}/export']['get']['responses']['200']['content']['application/json'];

/**
 * 受講者管理 UseCase（講師向け）
 *
 * API-045: 受講者名簿取得
 * API-046: 講座内ロール変更
 * API-047: 受講権限剥奪
 * API-048: 受講者CSV出力
 */
@Injectable()
export class InstructorMemberUseCase {
  constructor(
    private readonly courseMemberOpsRepo: CourseMemberOpsRepository,
    private readonly memberRepo: CourseMemberRepository,
    private readonly courseRepo: CourseRepository,
  ) {}

  /**
   * API-045: 受講者名簿取得
   * x-roles: instructor
   */
  async getMembers(
    courseId: string,
    userId: string,
  ): Promise<MemberListResponse> {
    // TODO(TBD): Cursor実装
    // 1. CourseMember で instructor 権限確認
    // 2. CourseMember + User 結合で名簿取得
    // 3. CourseEnrollment の進捗情報を結合
    throw new Error('Not implemented');
  }

  /**
   * API-046: 講座内ロール変更
   * x-roles: instructor_owner
   * x-policy: 423_ON_FROZEN
   */
  async changeRole(
    courseId: string,
    targetUserId: string,
    body: RoleChangeBody,
    userId: string,
  ): Promise<RoleChangeResponse> {
    // TODO(TBD): Cursor実装
    // 1. instructor_owner 権限確認（ownerUserId 一致）
    // 2. 凍結チェック（423_ON_FROZEN）
    // 3. CourseMember.role を更新
    throw new Error('Not implemented');
  }

  /**
   * API-047: 受講権限剥奪
   * x-roles: instructor_owner
   * x-policy: 423_ON_FROZEN
   */
  async revoke(
    courseId: string,
    targetUserId: string,
    userId: string,
  ): Promise<RevokeResponse> {
    // TODO(TBD): Cursor実装
    // 1. instructor_owner 権限確認
    // 2. 凍結チェック（423_ON_FROZEN）
    // 3. 受講権限を剥奪（具体的な方式はSoT差分あり — CourseMember.isActive 未定義）
    throw new Error('Not implemented');
  }

  /**
   * API-048: 受講者CSV出力
   * x-roles: instructor_owner
   */
  async exportCsv(
    courseId: string,
    userId: string,
  ): Promise<ExportResponse> {
    // TODO(TBD): Cursor実装
    // 1. instructor_owner 権限確認
    // 2. 名簿 + 進捗データ取得
    // 3. CSV 形式に変換して返却
    throw new Error('Not implemented');
  }
}
