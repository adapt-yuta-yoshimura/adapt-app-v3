import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * User リポジトリ
 *
 * User テーブルへのデータアクセスを隠蔽する。
 * SoT: schema.prisma - User model
 */
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async updateName(id: string, name: string) {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }
}
