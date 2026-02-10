import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { GlobalRole } from '@prisma/client';

import type { paths, components } from '../../../generated';
import { AdminOperatorRepository } from '../repositories/admin-operator.repository';
import { AdminUserRepository } from '../repositories/admin-user.repository';
import { AuditEventRepository } from '../repositories/audit-event.repository';
import type { ValidatedUser } from '../../auth/strategies/jwt.strategy';

type OperatorResponse =
  paths['/api/v1/admin/operators']['post']['responses']['201']['content']['application/json'];
type GenericWriteRequest = components['schemas']['GenericWriteRequest'];

/**
 * API-ADMIN-16: 運営スタッフ追加
 * 既存ユーザーの globalRole を operator/root_operator に変更し、監査ログに記録する
 */
@Injectable()
export class AddOperatorUseCase {
  constructor(
    private readonly operatorRepo: AdminOperatorRepository,
    private readonly userRepo: AdminUserRepository,
    private readonly auditRepo: AuditEventRepository,
  ) {}

  async execute(
    actor: ValidatedUser,
    body: GenericWriteRequest,
  ): Promise<OperatorResponse> {
    // body から userId, globalRole を抽出
    const userId = this.extractUserId(body);
    const globalRole = this.extractRole(body);

    // User 存在確認
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new BadRequestException(`User not found with id: ${userId}`);
    }

    // 既に運営スタッフか確認
    if (user.globalRole === GlobalRole.operator || user.globalRole === GlobalRole.root_operator) {
      throw new ConflictException('User is already a platform operator');
    }

    // globalRole を変更（運営スタッフに昇格）
    const updatedUser = await this.operatorRepo.promoteToOperator({
      userId,
      globalRole,
    });

    // 監査ログ記録
    const reason = this.extractReason(body);
    await this.auditRepo.create({
      actorUserId: actor.keycloakId,
      eventType: 'operator_role_changed' as const,
      actorGlobalRole: actor.globalRole as GlobalRole,
      reason,
      metaJson: {
        targetUserId: userId,
        targetEmail: user.email,
        assignedRole: globalRole,
        action: 'promoted_to_operator',
      },
    });

    // OperatorAdminView を返却
    return {
      id: updatedUser.id,
      email: updatedUser.email ?? null,
      name: updatedUser.name ?? null,
      globalRole: updatedUser.globalRole as 'operator' | 'root_operator',
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  }

  private extractUserId(body: GenericWriteRequest): string {
    if (typeof body === 'object' && body !== null && 'userId' in body) {
      const userId = (body as { userId?: unknown }).userId;
      if (typeof userId === 'string' && userId.length > 0) {
        return userId;
      }
    }
    throw new BadRequestException('userId is required');
  }

  private extractRole(body: GenericWriteRequest): 'operator' | 'root_operator' {
    if (typeof body === 'object' && body !== null && 'globalRole' in body) {
      const role = (body as { globalRole?: unknown }).globalRole;
      if (role === 'operator' || role === 'root_operator') {
        return role;
      }
    }
    throw new BadRequestException('Valid globalRole (operator or root_operator) is required');
  }

  private extractReason(body: GenericWriteRequest): string {
    if (typeof body === 'object' && body !== null && 'reason' in body) {
      const reason = (body as { reason?: unknown }).reason;
      if (typeof reason === 'string') {
        return reason;
      }
    }
    return '';
  }
}
