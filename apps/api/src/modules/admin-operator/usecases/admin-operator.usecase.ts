import { Injectable } from '@nestjs/common';
import { OperatorRepository } from '../repositories/operator.repository';
import { AuditEventRepository } from '../../audit/repositories/audit-event.repository';

/**
 * 運営スタッフ管理ユースケース（Admin）
 *
 * ADMIN-03チケット: 運営スタッフの一覧、招待、編集、削除
 * x-roles: root_operator のみ
 */
@Injectable()
export class AdminOperatorUseCase {
  constructor(
    private readonly operatorRepo: OperatorRepository,
    private readonly auditEventRepo: AuditEventRepository,
  ) {}

  /**
   * API-ADMIN-15: 運営スタッフ一覧
   * - DB: User（globalRole ∈ [operator, root_operator]）
   */
  async listOperators(): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - operatorRepo.findOperators() で取得
    // - OperatorAdminView 形式に変換
    // - ページネーション（ListMeta）
    throw new Error('Not implemented');
  }

  /**
   * API-ADMIN-16: 運営スタッフ招待
   * - Keycloakユーザー作成 → 招待メール送信
   * - x-policy: AUDIT_LOG
   * - DB: User, AuditEvent
   */
  async inviteOperator(actorUserId: string, params: {
    email: string;
    name: string;
    globalRole: 'operator' | 'root_operator';
  }): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - メールアドレス重複チェック（409 Conflict）
    // - Keycloakにユーザー作成
    // - パスワード設定リンク付き招待メール送信
    // - operatorRepo.create() でDB保存
    // - auditEventRepo.create() で監査ログ記録
    throw new Error('Not implemented');
  }

  /**
   * API-ADMIN-17: 運営スタッフ編集（ロール変更）
   * - operator ⇔ root_operator のロール変更
   * - x-policy: AUDIT_LOG
   * - DB: User, AuditEvent（eventType: operator_role_changed）
   */
  async updateOperator(actorUserId: string, userId: string, params: {
    globalRole: 'operator' | 'root_operator';
  }): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - operatorRepo.findOperatorById() で存在確認（404）
    // - operatorRepo.updateRole() でロール変更
    // - auditEventRepo.create() で監査ログ記録（eventType: operator_role_changed）
    throw new Error('Not implemented');
  }

  /**
   * API-ADMIN-18: 運営スタッフ削除（論理削除）
   * - x-policy: AUDIT_LOG
   * - DB: User, AuditEvent
   */
  async deleteOperator(actorUserId: string, userId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - operatorRepo.findOperatorById() で存在確認（404）
    // - operatorRepo.softDelete() で論理削除（deletedAt + isActive=false, globalRole は保持）
    // - auditEventRepo.create() で監査ログ記録
    throw new Error('Not implemented');
  }
}
