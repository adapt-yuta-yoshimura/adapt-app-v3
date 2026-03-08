import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AuditEventType, GlobalRole } from '@prisma/client';
import type { User } from '@prisma/client';
import { OperatorRepository } from '../repositories/operator.repository';
import { AuditEventRepository } from '../../audit/repositories/audit-event.repository';

/** OpenAPI OperatorAdminView 相当 */
export type OperatorAdminView = {
  id: string;
  email: string | null;
  name: string | null;
  globalRole: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/** OpenAPI OperatorListResponse 相当 */
export type OperatorListResponse = {
  items: OperatorAdminView[];
  meta: ListMeta;
};

/** OpenAPI ListMeta 相当 */
export type ListMeta = {
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
};

/** OpenAPI SuccessResponse 相当 */
export type SuccessResponse = { success: boolean; message?: string };

/** 監査ログ用の実行者情報（Controller から渡す） */
export type ActorContext = {
  actorEmail: string | null;
  actorName: string | null;
};

/**
 * 運営スタッフ管理ユースケース（Admin）
 *
 * ADMIN-03チケット: 運営スタッフの一覧、招待、編集、削除
 * x-roles: root_operator のみ
 *
 * CLAUDE.MD §11 UseCase粒度ルール:
 * - 新規モジュール（admin）: 1 UseCase 1 ファイルを原則
 * - 分割トリガー: クラス規模超過 / 責務分岐 / テスト困難
 * - 現時点では単一クラスで4メソッドを管理（分割は Cursor 判断）
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
  async listOperators(
    _actorUserId: string,
    query?: {
      page?: number;
      perPage?: number;
    },
  ): Promise<OperatorListResponse> {
    const { operators, totalCount } = await this.operatorRepo.findOperators({
      page: query?.page,
      perPage: query?.perPage,
    });

    const page = Math.max(1, query?.page ?? 1);
    const perPage = Math.min(100, Math.max(1, query?.perPage ?? 20));
    const totalPages = Math.ceil(totalCount / perPage) || 1;

    const items: OperatorAdminView[] = operators.map((u) =>
      this.toOperatorAdminView(u),
    );

    return {
      items,
      meta: { totalCount, page, perPage, totalPages },
    };
  }

  /**
   * API-ADMIN-16: 運営スタッフ招待
   * - メール重複で 409。Keycloak/招待メールは TODO(TBD) とし、DB 作成 + 監査のみ実装。
   * - x-policy: AUDIT_LOG
   */
  async inviteOperator(
    actorUserId: string,
    actorGlobalRole: GlobalRole,
    params: {
      email: string;
      name: string;
      globalRole: 'operator' | 'root_operator';
    },
    actorContext?: ActorContext,
  ): Promise<OperatorAdminView> {
    const allowedRoles: ('operator' | 'root_operator')[] = ['operator', 'root_operator'];
    if (!allowedRoles.includes(params.globalRole)) {
      throw new BadRequestException('globalRole must be operator or root_operator');
    }

    const existing = await this.operatorRepo.findByEmail(params.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.operatorRepo.create({
      email: params.email,
      name: params.name,
      globalRole: params.globalRole as GlobalRole,
    });

    await this.auditEventRepo.create({
      actorUserId,
      eventType: AuditEventType.user_created,
      actorGlobalRole: actorGlobalRole as GlobalRole,
      reason: '運営スタッフ招待',
      metaJson: {
        targetUserId: user.id,
        targetEmail: user.email,
        targetName: user.name,
        targetGlobalRole: user.globalRole,
        actorEmail: actorContext?.actorEmail ?? undefined,
        actorName: actorContext?.actorName ?? undefined,
      },
    });

    // TODO(TBD): Keycloakユーザー作成 + パスワード設定リンク付き招待メール送信

    return this.toOperatorAdminView(user);
  }

  /**
   * API-ADMIN-17: 運営スタッフ編集（ロール変更）
   * - operator ⇔ root_operator のロール変更
   * - x-policy: AUDIT_LOG
   * - AuditEventType: operator_role_changed
   */
  async updateOperator(
    actorUserId: string,
    actorGlobalRole: GlobalRole,
    userId: string,
    params: {
      globalRole: 'operator' | 'root_operator';
    },
    actorContext?: ActorContext,
  ): Promise<OperatorAdminView> {
    const allowedRoles: ('operator' | 'root_operator')[] = ['operator', 'root_operator'];
    if (!allowedRoles.includes(params.globalRole)) {
      throw new BadRequestException('globalRole must be operator or root_operator');
    }

    const target = await this.operatorRepo.findOperatorById(userId);
    if (!target) {
      throw new NotFoundException('Operator not found');
    }

    const updated = await this.operatorRepo.updateRole(
      userId,
      params.globalRole as GlobalRole,
    );

    await this.auditEventRepo.create({
      actorUserId,
      eventType: AuditEventType.operator_role_changed,
      actorGlobalRole: actorGlobalRole as GlobalRole,
      reason: '運営スタッフロール変更',
      metaJson: {
        targetUserId: userId,
        targetEmail: target.email,
        targetName: target.name,
        targetGlobalRole: target.globalRole,
        previousRole: target.globalRole,
        newRole: params.globalRole,
        actorEmail: actorContext?.actorEmail ?? undefined,
        actorName: actorContext?.actorName ?? undefined,
      },
    });

    return this.toOperatorAdminView(updated);
  }

  /**
   * API-ADMIN-18: 運営スタッフ削除（論理削除）
   * - deletedAt + isActive=false（globalRole は変更しない：復帰時の参考情報として保持）
   * - x-policy: AUDIT_LOG
   * - AuditEventType: user_deleted
   */
  async deleteOperator(
    actorUserId: string,
    actorGlobalRole: GlobalRole,
    userId: string,
    actorContext?: ActorContext,
  ): Promise<SuccessResponse> {
    const target = await this.operatorRepo.findOperatorById(userId);
    if (!target) {
      throw new NotFoundException('Operator not found');
    }

    await this.operatorRepo.softDelete(userId);

    await this.auditEventRepo.create({
      actorUserId,
      eventType: AuditEventType.user_deleted,
      actorGlobalRole: actorGlobalRole as GlobalRole,
      reason: '運営スタッフ論理削除',
      metaJson: {
        targetUserId: userId,
        targetEmail: target.email,
        targetName: target.name,
        targetGlobalRole: target.globalRole,
        actorEmail: actorContext?.actorEmail ?? undefined,
        actorName: actorContext?.actorName ?? undefined,
      },
    });

    return { success: true, message: '運営スタッフを削除しました' };
  }

  private toOperatorAdminView(u: User): OperatorAdminView {
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      globalRole: u.globalRole,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    };
  }
}
