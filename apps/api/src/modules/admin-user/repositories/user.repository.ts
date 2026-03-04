import { Injectable } from '@nestjs/common';
import type { User, GlobalRole } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

export type UserListResult = {
  users: User[];
  totalCount: number;
};

/**
 * ユーザーリポジトリ
 *
 * User テーブルへのデータアクセスを担当。
 * SoT: schema.prisma - User モデル
 *
 * CLAUDE.MD §11: Repository は「どこから取るか」（DB操作）を担当
 */
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params?: {
    globalRole?: GlobalRole;
    isActive?: boolean;
    includeDeleted?: boolean;
    page?: number;
    perPage?: number;
  }): Promise<UserListResult> {
    const page = Math.max(1, params?.page ?? 1);
    const perPage = Math.min(100, Math.max(1, params?.perPage ?? 20));
    const skip = (page - 1) * perPage;

    const where: {
      globalRole?: GlobalRole;
      isActive?: boolean;
      deletedAt?: Date | null;
    } = {};
    if (params?.globalRole !== undefined) {
      where.globalRole = params.globalRole;
    }
    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }
    if (params?.includeDeleted !== true) {
      where.deletedAt = null;
    }

    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { users, totalCount };
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(params: {
    email: string | null;
    name: string | null;
    globalRole: GlobalRole;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: params.email,
        name: params.name,
        globalRole: params.globalRole,
      },
    });
  }

  async update(
    id: string,
    params: {
      email?: string | null;
      name?: string | null;
      globalRole?: GlobalRole;
      isActive?: boolean;
    },
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(params.email !== undefined && { email: params.email }),
        ...(params.name !== undefined && { name: params.name }),
        ...(params.globalRole !== undefined && { globalRole: params.globalRole }),
        ...(params.isActive !== undefined && { isActive: params.isActive }),
      },
    });
  }

  async softDelete(id: string): Promise<User> {
    const now = new Date();
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: now, isActive: false },
    });
  }
}
