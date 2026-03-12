import { Injectable } from '@nestjs/common';
import type { PasswordCredential } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * PasswordCredential リポジトリ
 *
 * PasswordCredential テーブルへのデータアクセスを隠蔽する。
 * SoT: schema.prisma - PasswordCredential model
 * @@unique([userId])
 */
@Injectable()
export class PasswordCredentialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<PasswordCredential | null> {
    // TODO(TBD): Cursor実装
    // - @@unique([userId]) を利用
    throw new Error('Not implemented');
  }

  async updatePassword(userId: string, passwordHash: string): Promise<PasswordCredential> {
    // TODO(TBD): Cursor実装
    // - passwordHash + passwordUpdatedAt = now() を更新
    throw new Error('Not implemented');
  }
}
