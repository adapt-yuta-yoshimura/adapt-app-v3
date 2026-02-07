import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { ValidatedUser } from '../strategies/jwt.strategy';

/**
 * ロールベース認可ガード
 * Keycloak JWT 内の realm_roles を使ってロールチェックする
 *
 * root_operator は operator を包含する（上位互換）
 * 例: @Roles('operator') → operator と root_operator の両方がアクセス可能
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<
      string[] | undefined
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);

    // @Roles() が指定されていない場合はアクセス許可
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as ValidatedUser | undefined;

    if (!user) {
      throw new ForbiddenException('No user context found');
    }

    // ロール包含ルール: root_operator は operator の権限も持つ
    const effectiveRoles = [...user.realmRoles];
    if (
      effectiveRoles.includes('root_operator') &&
      !effectiveRoles.includes('operator')
    ) {
      effectiveRoles.push('operator');
    }

    const hasRole = requiredRoles.some((role) => effectiveRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Requires one of roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
