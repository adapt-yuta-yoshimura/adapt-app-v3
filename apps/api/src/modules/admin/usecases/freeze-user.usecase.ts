import { Injectable, NotFoundException } from '@nestjs/common';
import { GlobalRole } from '@prisma/client';

import type { paths } from '../../../generated';
import { AuditEventRepository } from '../repositories/audit-event.repository';
import { AdminUserRepository } from '../repositories/admin-user.repository';
import type { ValidatedUser } from '../../auth/strategies/jwt.strategy';

type FreezeUserResponse =
  paths['/api/v1/admin/users/{userId}/freeze']['post']['responses']['201']['content']['application/json'];

/**
 * API-075: ユーザー凍結(BAN)
 * isActive=false に更新し、監査ログに user_frozen を記録する
 */
@Injectable()
export class FreezeUserUseCase {
  constructor(
    private readonly userRepo: AdminUserRepository,
    private readonly auditRepo: AuditEventRepository,
  ) {}

  async execute(
    actor: ValidatedUser,
    userId: string,
    body: { reason?: string },
  ): Promise<FreezeUserResponse> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepo.updateIsActive(userId, false);

    const reason = typeof body?.reason === 'string' ? body.reason : '';
    await this.auditRepo.create({
      actorUserId: actor.keycloakId,
      eventType: 'user_frozen' as const,
      actorGlobalRole: actor.globalRole as GlobalRole,
      reason,
      metaJson: { targetUserId: userId },
    });

    return { success: true };
  }
}
