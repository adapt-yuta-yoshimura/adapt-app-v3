import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import type { paths } from '../../../generated';
import { AdminUserRepository } from '../repositories/admin-user.repository';

type UserListResponse =
  paths['/api/v1/admin/users']['get']['responses']['200']['content']['application/json'];

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * API-074: 全ユーザー一覧取得
 * ページネーション付きでユーザー一覧を返す
 */
@Injectable()
export class ListUsersUseCase {
  constructor(private readonly userRepo: AdminUserRepository) {}

  async execute(
    page?: number,
    pageSize?: number,
  ): Promise<UserListResponse> {
    const p = Math.max(1, page ?? DEFAULT_PAGE);
    const ps = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, pageSize ?? DEFAULT_PAGE_SIZE),
    );
    const skip = (p - 1) * ps;

    const [users, total] = await Promise.all([
      this.userRepo.findAll(skip, ps),
      this.userRepo.count(),
    ]);

    const items = users.map((u) => this.toUserAdminView(u));
    const totalPages = Math.ceil(total / ps);
    return {
      items,
      meta: {
        totalCount: total,
        page: p,
        perPage: ps,
        totalPages,
      },
    };
  }

  private toUserAdminView(user: User): UserListResponse['items'][number] {
    const status = user.deletedAt
      ? 'deleted'
      : user.isActive
        ? 'active'
        : 'frozen';
    return {
      user: {
        id: user.id,
        email: user.email ?? null,
        name: user.name ?? null,
        isActive: user.isActive,
        deletedAt: user.deletedAt?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        globalRole: user.globalRole,
      },
      status,
      lastLoginAt: null,
    };
  }
}
