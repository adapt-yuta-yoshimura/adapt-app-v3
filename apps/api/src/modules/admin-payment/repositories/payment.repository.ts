import { Injectable } from '@nestjs/common';
import type { Payment } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

/** 一覧取得のフィルター・ページネーション・ソート */
export type PaymentFindManyParams = {
  status?: string;
  provider?: string;
  page?: number;
  perPage?: number;
  sortBy?: 'createdAt' | 'amount' | 'status' | 'paidAt';
  sortOrder?: 'asc' | 'desc';
};

/** User id → name（表示名） */
export type UserNameMap = Record<string, string>;

/** Course id → title */
export type CourseTitleMap = Record<string, string>;

/** 一覧取得結果（UseCase で PaymentSummaryView に組み立てる） */
export type PaymentFindManyResult = {
  items: Payment[];
  totalCount: number;
  userMap: UserNameMap;
  courseMap: CourseTitleMap;
};

/**
 * 決済リポジトリ
 *
 * Payment テーブルへのデータアクセスを担当。
 * SoT: schema.prisma - Payment モデル
 *
 * PaymentSummaryView の userName / courseTitle は
 * User / Course を別クエリで取得し、UseCase で結合する。
 */
@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyWithRelations(
    params?: PaymentFindManyParams,
  ): Promise<PaymentFindManyResult> {
    const page = Math.max(1, params?.page ?? 1);
    const perPage = Math.min(100, Math.max(1, params?.perPage ?? 20));
    const skip = (page - 1) * perPage;

    const where: Prisma.PaymentWhereInput = {};
    if (
      params?.status !== undefined &&
      ['pending', 'succeeded', 'failed', 'canceled', 'refunded'].includes(
        params.status,
      )
    ) {
      where.status = params.status as Prisma.EnumPaymentStatusFilter['equals'];
    }
    if (
      params?.provider !== undefined &&
      ['stripe', 'manual'].includes(params.provider)
    ) {
      where.provider =
        params.provider as Prisma.EnumPaymentProviderFilter['equals'];
    }

    const sortBy = params?.sortBy ?? 'createdAt';
    const sortOrder = params?.sortOrder ?? 'desc';
    const orderBy: Prisma.PaymentOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [items, totalCount] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
      }),
      this.prisma.payment.count({ where }),
    ]);

    const userIds = [...new Set(items.map((p) => p.userId))];
    const courseIds = [
      ...new Set(items.map((p) => p.courseId).filter((id): id is string => id != null)),
    ];

    const [users, courses] = await Promise.all([
      userIds.length > 0
        ? this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
      courseIds.length > 0
        ? this.prisma.course.findMany({
            where: { id: { in: courseIds } },
            select: { id: true, title: true },
          })
        : Promise.resolve([]),
    ]);

    const userMap: UserNameMap = {};
    for (const u of users) {
      userMap[u.id] = u.name ?? '';
    }
    const courseMap: CourseTitleMap = {};
    for (const c of courses) {
      courseMap[c.id] = c.title;
    }

    return { items, totalCount, userMap, courseMap };
  }
}
