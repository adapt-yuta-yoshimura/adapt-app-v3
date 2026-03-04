import { Injectable } from '@nestjs/common';
import type { Payment } from '@prisma/client';
import {
  PaymentRepository,
  type PaymentFindManyParams,
} from '../repositories/payment.repository';

/** OpenAPI PaymentSummaryView 相当（SoT: openapi_admin.yaml） */
export type PaymentSummaryView = {
  id: string;
  userId: string;
  userName: string;
  courseId: string | null;
  courseTitle: string | null;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  paidAt: string | null;
  createdAt: string;
};

/** OpenAPI ListMeta 相当 */
export type ListMeta = {
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
};

/** OpenAPI PaymentListResponse 相当（SoT: openapi_admin.yaml） */
export type PaymentListResponse = {
  items: PaymentSummaryView[];
  meta: ListMeta;
};

/**
 * 決済管理ユースケース（Admin）
 *
 * ADMIN-05チケット: 決済履歴の一覧取得
 */
@Injectable()
export class AdminPaymentUseCase {
  constructor(private readonly paymentRepo: PaymentRepository) {}

  /**
   * API-ADMIN-19: 決済履歴一覧
   * - DB: Payment + User（userName結合）+ Course（courseTitle結合）
   * - PaymentSummaryView にマッピング
   */
  async listPayments(
    _actorUserId: string,
    query?: PaymentFindManyParams,
  ): Promise<PaymentListResponse> {
    const result = await this.paymentRepo.findManyWithRelations(query);

    const page = Math.max(1, query?.page ?? 1);
    const perPage = Math.min(
      100,
      Math.max(1, query?.perPage ?? 20),
    );
    const totalPages = Math.ceil(result.totalCount / perPage) || 1;

    const items: PaymentSummaryView[] = result.items.map((p) =>
      this.toPaymentSummaryView(p, result.userMap, result.courseMap),
    );

    return {
      items,
      meta: {
        totalCount: result.totalCount,
        page,
        perPage,
        totalPages,
      },
    };
  }

  private toPaymentSummaryView(
    payment: Payment,
    userMap: Record<string, string>,
    courseMap: Record<string, string>,
  ): PaymentSummaryView {
    return {
      id: payment.id,
      userId: payment.userId,
      userName: userMap[payment.userId] ?? '',
      courseId: payment.courseId ?? null,
      courseTitle:
        payment.courseId != null
          ? courseMap[payment.courseId] ?? null
          : null,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      provider: payment.provider,
      paidAt: payment.paidAt != null ? payment.paidAt.toISOString() : null,
      createdAt: payment.createdAt.toISOString(),
    };
  }
}
