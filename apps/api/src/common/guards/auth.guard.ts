import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser, GlobalRole } from '../auth/jwt.types';
import { JwtTokenService } from '../auth/jwt-token.service';
import { UserLookupService } from '../auth/user-lookup.service';

/** Request に user を付与するための拡張 */
export interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

/**
 * 認証ガード（全Admin APIに適用）
 *
 * Authorization: Bearer {token} ヘッダーからJWTを取得し、
 * 検証後に request.user へ AuthenticatedUser を設定する。
 *
 * 認証フロー（ADMIN-00チケット準拠）:
 * 1. Authorization ヘッダーから Bearer トークンを抽出
 * 2. JwtTokenService でトークン検証
 * 3. JWTの sub から User を DB検索（OAuthIdentity 経由）
 * 4. request.user に AuthenticatedUser を設定
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly userLookupService: UserLookupService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers.authorization;

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    const payload = await this.jwtTokenService.verifyToken(token);
    const user = await this.userLookupService.findUserByOAuthSub(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found for token subject');
    }

    request.user = {
      userId: user.id,
      email: user.email ?? null,
      name: user.name ?? null,
      globalRole: user.globalRole as GlobalRole,
    };
    return true;
  }
}
