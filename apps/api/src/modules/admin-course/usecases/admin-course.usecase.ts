import { Injectable } from '@nestjs/common';
import { CourseRepository } from '../repositories/course.repository';
import { CourseMemberRepository } from '../repositories/course-member.repository';
import { AuditEventRepository } from '../../audit/repositories/audit-event.repository';

/**
 * 講座管理ユースケース（Admin）
 *
 * ADMIN-04チケット: 講座の一覧、代理作成、承認、凍結/解除、削除、監査閲覧
 */
@Injectable()
export class AdminCourseUseCase {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly courseMemberRepo: CourseMemberRepository,
    private readonly auditEventRepo: AuditEventRepository,
  ) {}

  /**
   * API-ADMIN-01: 全講座一覧
   * - DB: Course
   */
  async listCourses(): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - courseRepo.findMany() で講座一覧取得
    // - ページネーション（ListMeta）
    throw new Error('Not implemented');
  }

  /**
   * API-ADMIN-02: 講座代理作成（運営）
   * - ownerUserId=指定講師、status=draft、承認免除
   * - x-policy: AUDIT_LOG
   * - DB: Course, CourseMember, AuditEvent
   */
  async createCourse(actorUserId: string, params: {
    title: string;
    style: string;
    ownerUserId: string;
    description?: string;
    catalogVisibility?: string;
    visibility?: string;
  }): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - courseRepo.create() でコース作成（status=draft, createdByUserId=actorUserId）
    // - courseMemberRepo.create() で CourseMember 追加（role=instructor）
    //   ※ 公開（publish）時に instructor_owner へ昇格
    // - auditEventRepo.create() で監査ログ記録（eventType: course_created）
    throw new Error('Not implemented');
  }

  /**
   * API-ADMIN-03: 講座代理編集（運営）
   * - x-policy: AUDIT_LOG
   * - DB: Course, AuditEvent
   */
  async updateCourse(actorUserId: string, courseId: string, params: {
    title?: string;
    description?: string;
    catalogVisibility?: string;
    visibility?: string;
    ownerUserId?: string;
  }): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - courseRepo.findById() で存在確認（404）
    // - courseRepo.update() で更新
    // - auditEventRepo.create() で監査ログ記録
    throw new Error('Not implemented');
  }

  /**
   * API-ADMIN-04: 講座削除（運営）
   * - status=archived に変更（論理削除）
   * - x-policy: AUDIT_LOG
   * - DB: Course, AuditEvent
   */
  async deleteCourse(actorUserId: string, courseId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - courseRepo.findById() で存在確認（404）
    // - courseRepo.archive() で status=archived に変更
    // - auditEventRepo.create() で監査ログ記録
    throw new Error('Not implemented');
  }

  /**
   * API-ADMIN-05: 講座承認・審査
   * - status → active
   * - x-policy: AUDIT_LOG
   * - DB: Course, AuditEvent
   */
  async approveCourse(actorUserId: string, courseId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - courseRepo.findById() で存在確認
    // - status が pending_approval であることを確認
    // - courseRepo.approve() で status=active, approvedAt, approvedByUserId 設定
    // - auditEventRepo.create() で監査ログ記録（eventType: course_approved）
    throw new Error('Not implemented');
  }

  /**
   * API-ADMIN-06: コース凍結（運営）
   * - isFrozen=true
   * - x-policy: AUDIT_LOG
   * - DB: Course, AuditEvent
   */
  async freezeCourse(actorUserId: string, courseId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - courseRepo.findById() で存在確認
    // - courseRepo.freeze() で isFrozen=true, frozenAt, frozenByUserId 設定
    // - auditEventRepo.create() で監査ログ記録（eventType: course_frozen）
    throw new Error('Not implemented');
  }

  /**
   * API-ADMIN-07: コース凍結解除（運営）
   * - x-roles: root_operator のみ
   * - DB: Course
   */
  async unfreezeCourse(actorUserId: string, courseId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - courseRepo.findById() で存在確認
    // - courseRepo.unfreeze() で isFrozen=false, frozenAt/frozenByUserId クリア
    // - auditEventRepo.create() で監査ログ記録（eventType: course_unfrozen）
    throw new Error('Not implemented');
  }

  /**
   * API-ADMIN-08: [監査]凍結講座閲覧
   * - x-policy: AUDIT_LOG(強制)
   * - DB: Course, AuditEvent
   */
  async auditCourse(actorUserId: string, courseId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - courseRepo.findById() で存在確認
    // - 凍結中の秘匿コンテンツを取得
    // - auditEventRepo.create() で閲覧ログ強制記録
    throw new Error('Not implemented');
  }
}
