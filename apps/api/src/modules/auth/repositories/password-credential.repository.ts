import { Injectable } from '@nestjs/common';
import { PasswordCredential } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * パスワード認証情報リポジトリ
 * パスワードベースの認証データへのアクセスを提供する
 */
@Injectable()
export class PasswordCredentialRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ユーザーIDでパスワード認証情報を取得する
   * @param userId ユーザーID
   * @returns パスワード認証情報、見つからない場合はnull
   */
  async findByUserId(userId: string): Promise<PasswordCredential | null> {
    return this.prisma.passwordCredential.findUnique({
      where: { userId },
    });
  }

  /**
   * パスワード認証情報を新規作成する
   * @param data 作成データ
   * @returns 作成されたパスワード認証情報
   */
  async create(data: {
    userId: string;
    passwordHash: string;
    algorithm: string;
  }): Promise<PasswordCredential> {
    return this.prisma.passwordCredential.create({
      data: {
        userId: data.userId,
        passwordHash: data.passwordHash,
        algorithm: data.algorithm,
        passwordUpdatedAt: new Date(),
        failedCount: 0,
      },
    });
  }

  /**
   * パスワードハッシュを更新する
   * @param userId ユーザーID
   * @param passwordHash 新しいパスワードハッシュ
   * @returns 更新されたパスワード認証情報
   */
  async updatePassword(
    userId: string,
    passwordHash: string,
  ): Promise<PasswordCredential> {
    return this.prisma.passwordCredential.update({
      where: { userId },
      data: {
        passwordHash,
        passwordUpdatedAt: new Date(),
        failedCount: 0,
        lastFailedAt: null,
      },
    });
  }

  /**
   * ログイン失敗回数をインクリメントする
   * @param userId ユーザーID
   * @returns 更新されたパスワード認証情報
   */
  async incrementFailedCount(userId: string): Promise<PasswordCredential> {
    return this.prisma.passwordCredential.update({
      where: { userId },
      data: {
        failedCount: { increment: 1 },
        lastFailedAt: new Date(),
      },
    });
  }

  /**
   * ログイン失敗回数をリセットする
   * @param userId ユーザーID
   * @returns 更新されたパスワード認証情報
   */
  async resetFailedCount(userId: string): Promise<PasswordCredential> {
    return this.prisma.passwordCredential.update({
      where: { userId },
      data: {
        failedCount: 0,
        lastFailedAt: null,
      },
    });
  }
}
