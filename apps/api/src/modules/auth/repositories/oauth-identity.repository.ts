import { Injectable } from '@nestjs/common';
import { OAuthIdentity } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * OAuth ID リポジトリ
 * 外部OAuth認証情報へのアクセスを提供する
 */
@Injectable()
export class OAuthIdentityRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * プロバイダーとプロバイダーユーザーIDでOAuth情報を取得する
   * @param provider プロバイダー名（例: 'google'）
   * @param providerUserId プロバイダー側のユーザーID
   * @returns OAuth情報、見つからない場合はnull
   */
  async findByProviderAndProviderUserId(
    provider: string,
    providerUserId: string,
  ): Promise<OAuthIdentity | null> {
    return this.prisma.oAuthIdentity.findFirst({
      where: {
        provider,
        providerUserId,
      },
    });
  }

  /**
   * ユーザーIDでOAuth情報一覧を取得する
   * @param userId ユーザーID
   * @returns OAuth情報の配列
   */
  async findByUserId(userId: string): Promise<OAuthIdentity[]> {
    return this.prisma.oAuthIdentity.findMany({
      where: { userId },
    });
  }

  /**
   * OAuth情報を新規作成する
   * @param data 作成データ
   * @returns 作成されたOAuth情報
   */
  async create(data: {
    userId: string;
    provider: string;
    providerUserId: string;
    email?: string;
  }): Promise<OAuthIdentity> {
    return this.prisma.oAuthIdentity.create({
      data: {
        userId: data.userId,
        provider: data.provider,
        providerUserId: data.providerUserId,
        email: data.email,
        lastLoginAt: new Date(),
      },
    });
  }

  /**
   * 最終ログイン日時を更新する
   * @param id OAuthIdentity ID
   * @returns 更新されたOAuth情報
   */
  async updateLastLogin(id: string): Promise<OAuthIdentity> {
    return this.prisma.oAuthIdentity.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}
