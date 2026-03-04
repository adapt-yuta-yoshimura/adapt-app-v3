import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * 運営スタッフリポジトリ
 *
 * User テーブルから globalRole ∈ [operator, root_operator] のユーザーを操作。
 * SoT: schema.prisma - User モデル（globalRole フィールド）
 */
@Injectable()
export class OperatorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOperators(params?: {
    page?: number;
    perPage?: number;
  }): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - User テーブルから globalRole ∈ [operator, root_operator] でフィルタ
    throw new Error('Not implemented');
  }

  async findOperatorById(userId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - User テーブルから id + globalRole ∈ [operator, root_operator] で検索
    throw new Error('Not implemented');
  }

  async create(params: {
    email: string;
    name: string;
    globalRole: 'operator' | 'root_operator';
  }): Promise<unknown> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async updateRole(userId: string, globalRole: 'operator' | 'root_operator'): Promise<unknown> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }

  async softDelete(userId: string): Promise<unknown> {
    // TODO(TBD): Cursor実装
    // - deletedAt = now(), isActive = false（globalRole は保持）
    throw new Error('Not implemented');
  }
}
