import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * UserProfile リポジトリ
 *
 * UserProfile テーブルへのデータアクセスを隠蔽する。
 * SoT: schema.prisma - UserProfile model
 */
@Injectable()
export class UserProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async upsert(userId: string, data: { displayName?: string; bio?: string; avatarFileObjectId?: string }) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }
}
