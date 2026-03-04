import { Injectable } from '@nestjs/common';
import type { User, GlobalRole } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

export type OperatorListResult = {
  operators: User[];
  totalCount: number;
};

/**
 * 運営スタッフリポジトリ
 *
 * User テーブルから globalRole ∈ [operator, root_operator] のユーザーを操作。
 * SoT: schema.prisma - User モデル（globalRole フィールド）
 *
 * CLAUDE.MD §11: Repository は「どこから取るか」（DB操作）を担当
 */
@Injectable()
export class OperatorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOperators(params?: {
    page?: number;
    perPage?: number;
  }): Promise<OperatorListResult> {
    const page = Math.max(1, params?.page ?? 1);
    const perPage = Math.min(100, Math.max(1, params?.perPage ?? 20));
    const skip = (page - 1) * perPage;

    const where = {
      globalRole: { in: ['operator', 'root_operator'] as GlobalRole[] },
      deletedAt: null,
    };

    const [operators, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { operators, totalCount };
  }

  async findOperatorById(userId: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        globalRole: { in: ['operator', 'root_operator'] as GlobalRole[] },
        deletedAt: null,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(params: {
    email: string;
    name: string;
    globalRole: GlobalRole;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: params.email,
        name: params.name,
        globalRole: params.globalRole,
        isActive: true,
      },
    });
  }

  async updateRole(userId: string, globalRole: GlobalRole): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { globalRole },
    });
  }

  async softDelete(userId: string): Promise<User> {
    const now = new Date();
    return this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: now, isActive: false },
    });
  }
}
