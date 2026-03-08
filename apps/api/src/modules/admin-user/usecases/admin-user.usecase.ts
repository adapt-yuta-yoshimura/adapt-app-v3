import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { AuditEventType, GlobalRole } from '@prisma/client';
import type { User } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository';
import { OAuthIdentityRepository } from '../repositories/oauth-identity.repository';
import { AuditEventRepository } from '../../audit/repositories/audit-event.repository';

/** OpenAPI UserListResponse 相当 */
export type UserListResponse = {
  items: UserAdminView[];
  meta: ListMeta;
};

/** OpenAPI UserAdminView 相当 */
export type UserAdminView = {
  user: UserResponse;
  status: string;
  lastLoginAt: string | null;
};

/** OpenAPI User 相当（APIレスポンス用） */
export type UserResponse = {
  id: string;
  email: string | null;
  name: string | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  globalRole: string;
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
 * ユーザー管理ユースケース（Admin）
 *
 * ADMIN-02チケット: 受講者・講師の一覧、招待、編集、凍結/解除、論理削除
 *
 * CLAUDE.MD §11 UseCase粒度ルール:
 * - 新規モジュール（admin）: 1 UseCase 1 ファイルを原則
 * - 分割トリガー: クラス規模超過 / 責務分岐 / テスト困難
 * - 現時点では単一クラスで6メソッドを管理（分割は Cursor 判断）
 */
@Injectable()
export class AdminUserUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly oauthIdentityRepo: OAuthIdentityRepository,
    private readonly auditEventRepo: AuditEventRepository,
  ) {}

  /**
   * API-ADMIN-09: 全ユーザー一覧
   * - フィルタ: globalRole, isActive, deletedAt
   * - DB: User, OAuthIdentity（lastLoginAt）
   */
  async listUsers(
    _actorUserId: string,
    query?: {
      globalRole?: GlobalRole;
      isActive?: boolean;
      includeDeleted?: boolean;
      page?: number;
      perPage?: number;
    },
  ): Promise<UserListResponse> {
    const { users, totalCount } = await this.userRepo.findMany({
      globalRole: query?.globalRole,
      isActive: query?.isActive,
      includeDeleted: query?.includeDeleted,
      page: query?.page,
      perPage: query?.perPage,
    });
    const userIds = users.map((u) => u.id);
    const lastLoginMap = await this.oauthIdentityRepo.findLastLoginAtByUserIds(
      userIds,
    );
    const page = Math.max(1, query?.page ?? 1);
    const perPage = Math.min(100, Math.max(1, query?.perPage ?? 20));
    const totalPages = Math.ceil(totalCount / perPage) || 1;

    const items: UserAdminView[] = users.map((u) => ({
      user: this.toUserResponse(u),
      status: this.toStatus(u),
      lastLoginAt: lastLoginMap[u.id]
        ? lastLoginMap[u.id].toISOString()
        : null,
    }));

    return {
      items,
      meta: { totalCount, page, perPage, totalPages },
    };
  }

  /**
   * API-ADMIN-10: ユーザー招待（受講者/講師）
   * - メール重複で 409。Keycloak/招待メールは TODO(TBD) とし、DB 作成 + 監査のみ実装。
   */
  async inviteUser(
    actorUserId: string,
    actorGlobalRole: GlobalRole,
    params: {
      email: string;
      name: string;
      globalRole: 'learner' | 'instructor';
    },
    actorContext?: ActorContext,
  ): Promise<UserAdminView> {
    const existing = await this.userRepo.findByEmail(params.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    const user = await this.userRepo.create({
      email: params.email,
      name: params.name,
      globalRole: params.globalRole as GlobalRole,
    });
    await this.auditEventRepo.create({
      actorUserId,
      eventType: AuditEventType.user_created,
      actorGlobalRole: actorGlobalRole as GlobalRole,
      reason: 'User invited via admin',
      metaJson: {
        targetUserId: user.id,
        targetEmail: user.email,
        targetName: user.name,
        targetGlobalRole: user.globalRole,
        actorEmail: actorContext?.actorEmail ?? undefined,
        actorName: actorContext?.actorName ?? undefined,
      },
    });
    return {
      user: this.toUserResponse(user),
      status: this.toStatus(user),
      lastLoginAt: null,
    };
  }

  /**
   * API-ADMIN-11: ユーザー編集
   */
  async updateUser(
    actorUserId: string,
    actorGlobalRole: GlobalRole,
    userId: string,
    params: {
      email?: string;
      name?: string;
      globalRole?: 'learner' | 'instructor';
      isActive?: boolean;
    },
    actorContext?: ActorContext,
  ): Promise<UserResponse> {
    const target = await this.userRepo.findById(userId);
    if (!target) {
      throw new NotFoundException('User not found');
    }
    if (params.email !== undefined && params.email !== target.email) {
      const existing = await this.userRepo.findByEmail(params.email);
      if (existing) {
        throw new ConflictException('User with this email already exists');
      }
    }
    const updated = await this.userRepo.update(userId, {
      email: params.email,
      name: params.name,
      globalRole: params.globalRole as GlobalRole | undefined,
      isActive: params.isActive,
    });
    await this.auditEventRepo.create({
      actorUserId,
      eventType: AuditEventType.user_updated,
      actorGlobalRole: actorGlobalRole as GlobalRole,
      reason: 'User updated via admin',
      metaJson: {
        targetUserId: userId,
        targetEmail: target.email,
        targetName: target.name,
        targetGlobalRole: target.globalRole,
        actorEmail: actorContext?.actorEmail ?? undefined,
        actorName: actorContext?.actorName ?? undefined,
      },
    });
    return this.toUserResponse(updated);
  }

  /**
   * API-ADMIN-12: ユーザー論理削除
   */
  async deleteUser(
    actorUserId: string,
    actorGlobalRole: GlobalRole,
    userId: string,
    actorContext?: ActorContext,
  ): Promise<SuccessResponse> {
    const target = await this.userRepo.findById(userId);
    if (!target) {
      throw new NotFoundException('User not found');
    }
    await this.userRepo.softDelete(userId);
    await this.auditEventRepo.create({
      actorUserId,
      eventType: AuditEventType.user_deleted,
      actorGlobalRole: actorGlobalRole as GlobalRole,
      reason: 'User deleted via admin',
      metaJson: {
        targetUserId: userId,
        targetEmail: target.email,
        targetName: target.name,
        targetGlobalRole: target.globalRole,
        actorEmail: actorContext?.actorEmail ?? undefined,
        actorName: actorContext?.actorName ?? undefined,
      },
    });
    return { success: true };
  }

  /**
   * API-ADMIN-13: ユーザー凍結(BAN)
   */
  async freezeUser(
    actorUserId: string,
    actorGlobalRole: GlobalRole,
    userId: string,
    actorContext?: ActorContext,
  ): Promise<SuccessResponse> {
    const target = await this.userRepo.findById(userId);
    if (!target) {
      throw new NotFoundException('User not found');
    }
    await this.userRepo.update(userId, { isActive: false });
    await this.auditEventRepo.create({
      actorUserId,
      eventType: AuditEventType.user_frozen,
      actorGlobalRole: actorGlobalRole as GlobalRole,
      reason: 'User frozen via admin',
      metaJson: {
        targetUserId: userId,
        targetEmail: target.email,
        targetName: target.name,
        targetGlobalRole: target.globalRole,
        actorEmail: actorContext?.actorEmail ?? undefined,
        actorName: actorContext?.actorName ?? undefined,
      },
    });
    return { success: true };
  }

  /**
   * API-ADMIN-14: ユーザー凍結解除
   */
  async unfreezeUser(
    actorUserId: string,
    actorGlobalRole: GlobalRole,
    userId: string,
    actorContext?: ActorContext,
  ): Promise<SuccessResponse> {
    const target = await this.userRepo.findById(userId);
    if (!target) {
      throw new NotFoundException('User not found');
    }
    await this.userRepo.update(userId, { isActive: true });
    await this.auditEventRepo.create({
      actorUserId,
      eventType: AuditEventType.user_unfrozen,
      actorGlobalRole: actorGlobalRole as GlobalRole,
      reason: 'User unfrozen via admin',
      metaJson: {
        targetUserId: userId,
        targetEmail: target.email,
        targetName: target.name,
        targetGlobalRole: target.globalRole,
        actorEmail: actorContext?.actorEmail ?? undefined,
        actorName: actorContext?.actorName ?? undefined,
      },
    });
    return { success: true };
  }

  private toUserResponse(u: User): UserResponse {
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      isActive: u.isActive,
      deletedAt: u.deletedAt ? u.deletedAt.toISOString() : null,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      globalRole: u.globalRole,
    };
  }

  private toStatus(u: User): string {
    if (u.deletedAt) return 'deleted';
    if (!u.isActive) return 'frozen';
    return 'active';
  }
}
