import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import type { paths } from '../../../generated';
import { AdminOperatorRepository } from '../repositories/admin-operator.repository';

type OperatorListResponse =
  paths['/api/v1/admin/operators']['get']['responses']['200']['content']['application/json'];

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * API-ADMIN-15: 運営スタッフ一覧取得
 * ページネーション付きで運営スタッフ（globalRole が operator/root_operator）一覧を返す
 */
@Injectable()
export class ListOperatorsUseCase {
  constructor(private readonly operatorRepo: AdminOperatorRepository) {}

  async execute(
    page?: number,
    pageSize?: number,
  ): Promise<OperatorListResponse> {
    const p = Math.max(1, page ?? DEFAULT_PAGE);
    const ps = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, pageSize ?? DEFAULT_PAGE_SIZE),
    );
    const skip = (p - 1) * ps;

    const [operators, total] = await Promise.all([
      this.operatorRepo.findAll(skip, ps),
      this.operatorRepo.count(),
    ]);

    const items = operators.map((user) => this.toOperatorAdminView(user));
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

  private toOperatorAdminView(
    user: User,
  ): OperatorListResponse['items'][number] {
    return {
      id: user.id,
      email: user.email ?? null,
      name: user.name ?? null,
      globalRole: user.globalRole as 'operator' | 'root_operator',
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
