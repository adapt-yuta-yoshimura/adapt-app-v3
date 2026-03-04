/**
 * Admin ユーザー管理 API クライアント（ADMIN-02）
 *
 * SoT: openapi_admin.yaml - API-ADMIN-09〜14
 * 型は OpenAPI スキーマに準拠（生成型が未整備のため手動定義）
 */

import { adminApiFetch } from './api-client';

/** OpenAPI User */
export interface UserAdminViewUser {
  id: string;
  email: string | null;
  name: string | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  globalRole: string;
}

/** OpenAPI UserAdminView */
export interface UserAdminView {
  user: UserAdminViewUser;
  status: string;
  lastLoginAt: string | null;
}

/** OpenAPI UserListResponse */
export interface UserListResponse {
  items: UserAdminView[];
  meta: {
    totalCount: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

/** OpenAPI UserInviteRequest */
export interface UserInviteRequest {
  email: string;
  name: string;
  globalRole: 'learner' | 'instructor';
}

/** OpenAPI UserUpdateRequest */
export interface UserUpdateRequest {
  email?: string;
  name?: string;
  globalRole?: 'learner' | 'instructor';
  isActive?: boolean;
}

/** OpenAPI SuccessResponse */
export interface SuccessResponse {
  success: boolean;
  message?: string;
}

const USERS_BASE = '/api/v1/admin/users';

export async function fetchUserList(params?: {
  globalRole?: 'learner' | 'instructor';
  isActive?: boolean;
  includeDeleted?: boolean;
  page?: number;
  perPage?: number;
}): Promise<UserListResponse> {
  const search = new URLSearchParams();
  if (params?.globalRole) search.set('globalRole', params.globalRole);
  if (params?.isActive !== undefined) search.set('isActive', String(params.isActive));
  if (params?.includeDeleted) search.set('includeDeleted', 'true');
  if (params?.page !== undefined) search.set('page', String(params.page));
  if (params?.perPage !== undefined) search.set('perPage', String(params.perPage));
  const q = search.toString();
  return adminApiFetch<UserListResponse>(`${USERS_BASE}${q ? `?${q}` : ''}`);
}

export async function inviteUser(body: UserInviteRequest): Promise<UserAdminView> {
  return adminApiFetch<UserAdminView>(USERS_BASE, {
    method: 'POST',
    body,
  });
}

export async function updateUser(
  userId: string,
  body: UserUpdateRequest
): Promise<UserAdminViewUser> {
  return adminApiFetch<UserAdminViewUser>(`${USERS_BASE}/${userId}`, {
    method: 'PATCH',
    body,
  });
}

export async function deleteUser(userId: string): Promise<SuccessResponse> {
  return adminApiFetch<SuccessResponse>(`${USERS_BASE}/${userId}`, {
    method: 'DELETE',
  });
}

export async function freezeUser(userId: string): Promise<SuccessResponse> {
  return adminApiFetch<SuccessResponse>(`${USERS_BASE}/${userId}/freeze`, {
    method: 'POST',
    body: {},
  });
}

export async function unfreezeUser(userId: string): Promise<SuccessResponse> {
  return adminApiFetch<SuccessResponse>(`${USERS_BASE}/${userId}/unfreeze`, {
    method: 'POST',
    body: {},
  });
}
