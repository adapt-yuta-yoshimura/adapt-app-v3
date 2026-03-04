/**
 * Admin 運営スタッフ管理 API クライアント（ADMIN-03）
 *
 * SoT: openapi_admin.yaml - API-ADMIN-15〜18
 * 型は OpenAPI スキーマに準拠（生成型が未整備のため手動定義）
 */

import { adminApiFetch } from './api-client';

/** OpenAPI OperatorAdminView */
export interface OperatorAdminView {
  id: string;
  email: string | null;
  name: string | null;
  globalRole: 'operator' | 'root_operator';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** OpenAPI OperatorListResponse */
export interface OperatorListResponse {
  items: OperatorAdminView[];
  meta: {
    totalCount: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

/** OpenAPI OperatorInviteRequest */
export interface OperatorInviteRequest {
  email: string;
  name: string;
  globalRole: 'operator' | 'root_operator';
}

/** OpenAPI OperatorUpdateRequest */
export interface OperatorUpdateRequest {
  globalRole: 'operator' | 'root_operator';
}

/** OpenAPI SuccessResponse */
export interface SuccessResponse {
  success: boolean;
  message?: string;
}

const OPERATORS_BASE = '/api/v1/admin/operators';

export async function fetchOperatorList(params?: {
  page?: number;
  perPage?: number;
}): Promise<OperatorListResponse> {
  const search = new URLSearchParams();
  if (params?.page !== undefined) search.set('page', String(params.page));
  if (params?.perPage !== undefined) search.set('perPage', String(params.perPage));
  const q = search.toString();
  return adminApiFetch<OperatorListResponse>(`${OPERATORS_BASE}${q ? `?${q}` : ''}`);
}

export async function inviteOperator(body: OperatorInviteRequest): Promise<OperatorAdminView> {
  return adminApiFetch<OperatorAdminView>(OPERATORS_BASE, {
    method: 'POST',
    body,
  });
}

export async function updateOperator(
  userId: string,
  body: OperatorUpdateRequest,
): Promise<OperatorAdminView> {
  return adminApiFetch<OperatorAdminView>(`${OPERATORS_BASE}/${userId}`, {
    method: 'PATCH',
    body,
  });
}

export async function deleteOperator(userId: string): Promise<SuccessResponse> {
  return adminApiFetch<SuccessResponse>(`${OPERATORS_BASE}/${userId}`, {
    method: 'DELETE',
  });
}
