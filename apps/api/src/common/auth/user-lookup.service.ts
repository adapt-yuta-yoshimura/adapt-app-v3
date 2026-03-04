import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '@prisma/client';

/**
 * JWTの sub（OIDC subject）から User を解決する技術サービス。
 *
 * OAuthIdentity を経由して providerUserId === sub となる User を取得する。
 * 環境変数 AUTH_OIDC_PROVIDER でプロバイダ名を指定（未設定時は 'keycloak'）。
 */
@Injectable()
export class UserLookupService {
  private get provider(): string {
    return process.env.AUTH_OIDC_PROVIDER ?? 'keycloak';
  }

  constructor(private readonly prisma: PrismaService) {}

  /**
   * OIDCの sub（providerUserId）から User を取得する
   *
   * @param sub - JWT の sub クレーム（Keycloak のユーザーID）
   * @returns User または null
   */
  async findUserByOAuthSub(sub: string): Promise<User | null> {
    const identity = await this.prisma.oAuthIdentity.findFirst({
      where: {
        provider: this.provider,
        providerUserId: sub,
      },
    });
    if (!identity) {
      return null;
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: identity.userId,
        deletedAt: null,
        isActive: true,
      },
    });
    return user;
  }
}
