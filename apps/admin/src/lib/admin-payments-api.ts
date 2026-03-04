/**
 * ADMIN-05: 決済管理 API クライアント
 *
 * SoT: openapi_admin.yaml - API-ADMIN-19
 *
 * TODO(TBD): pnpm generate:types 実行後、OpenAPI 生成型に置換
 */

import { adminApiFetch } from './api-client';

// ---------------------------------------------------------------------------
// 型定義（OpenAPI 準拠・手動定義）
// TODO(TBD): OpenAPI 生成型に置換
// ---------------------------------------------------------------------------

/** PaymentStatus enum（SoT: schema.prisma） */
export type PaymentStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded';

/** PaymentProvider enum（SoT: schema.prisma） */
export type PaymentProvider = 'stripe' | 'manual';

/** PaymentSummaryView（SoT: openapi_admin.yaml） */
export type PaymentSummaryView = {
  id: string;
  userId: string;
  userName: string;
  courseId: string | null;
  courseTitle: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  paidAt: string | null;
  createdAt: string;
};

/** ListMeta（ページネーション情報） */
export type ListMeta = {
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
};

/** PaymentListResponse（SoT: openapi_admin.yaml） */
export type PaymentListResponse = {
  items: PaymentSummaryView[];
  meta: ListMeta;
};

// ---------------------------------------------------------------------------
// API 定数
// ---------------------------------------------------------------------------

const PAYMENTS_BASE = '/payments';

// ---------------------------------------------------------------------------
// API 呼び出し関数
// ---------------------------------------------------------------------------

/**
 * API-ADMIN-19: 決済履歴一覧
 * GET /api/v1/admin/payments
 */
export async function fetchPaymentList(params?: {
  page?: number;
  perPage?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<PaymentListResponse> {
  const search = new URLSearchParams();
  if (params?.page !== undefined) search.set('page', String(params.page));
  if (params?.perPage !== undefined)
    search.set('perPage', String(params.perPage));
  if (params?.status) search.set('status', params.status);
  if (params?.sortBy) search.set('sortBy', params.sortBy);
  if (params?.sortOrder) search.set('sortOrder', params.sortOrder);
  const q = search.toString();
  return adminApiFetch<PaymentListResponse>(
    `${PAYMENTS_BASE}${q ? `?${q}` : ''}`,
  );
}
