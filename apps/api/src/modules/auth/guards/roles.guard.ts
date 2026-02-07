import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../services/jwt.service';
import { UserRepository } from '../repositories/user.repository';

/**
 * PlatformMembershipからロールを取得するためのリポジトリインターフェース
 * 将来的にPlatformMembershipRepositoryとして分離可能
 */
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * ロールベース認可ガード
 * @Roles() デコレータで指定されたロールを持つユーザーのみアクセスを許可する
 *
 * GlobalRole（グローバルロール）とPlatformRole（運営ロール）の両方をチェックする
 *
 * @example
 * ```typescript
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('operator', 'root_operator')
 * @Get('admin/users')
 * async listUsers(): Promise<UserDto[]> { ... }
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // @Roles() デコレータからロール一覧を取得
    const requiredRoles = this.reflector.getAllAndOverride<string[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // @Roles() が指定されていない場合はアクセス許可
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const jwtPayload = request.user as JwtPayload | undefined;

    if (!jwtPayload) {
      throw new ForbiddenException('No user context found');
    }

    // ユーザーのPlatformMembershipからロールを取得
    const platformMembership = await this.prisma.platformMembership.findFirst({
      where: { userId: jwtPayload.sub },
    });

    // ユーザーが持つロール一覧を構築
    const userRoles: string[] = [];

    if (platformMembership) {
      userRoles.push(platformMembership.role);
    }

    // 必要なロールのいずれかを持っているかチェック
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Requires one of roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
