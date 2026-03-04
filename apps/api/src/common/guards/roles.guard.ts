import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { GlobalRole } from '../auth/jwt.types';
import type { RequestWithUser } from './auth.guard';
import { ROLES_KEY } from './roles.decorator';

/**
 * ロールガード（x-roles に基づくロールチェック）
 *
 * @Roles() デコレータで指定されたロールと、
 * request.user.globalRole を照合する。
 *
 * Admin API では operator / root_operator のみ許可。
 * エンドポイントごとに x-roles の指定に従う。
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<GlobalRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const hasRole = requiredRoles.includes(user.globalRole);
    if (!hasRole) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
