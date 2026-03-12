import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * User リポジトリ
 *
 * User テーブルへのデータアクセスを隠蔽する。
 * SoT: schema.prisma - User model
 */
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string): Promise<User | null> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async update(userId: string, data: {
    email?: string;
    name?: string;
    isActive?: boolean;
    deletedAt?: Date | null;
  }): Promise<User> {
    // TODO(TBD): Cursor実装
    // - unique 制約違反（email）時の 409 ハンドリング
    throw new Error('Not implemented');
  }
}
