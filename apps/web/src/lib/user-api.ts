/**
 * ユーザー設定向け API（API-001, API-002, API-003）
 * Server Component 用。呼び出し元で getServerToken() を渡すこと。
 */
import type { paths } from '@adapt/types/openapi-app';
import { getApiBaseUrl } from './api-base-url';

export type GetProfileResponse =
  paths['/api/v1/users/me']['get']['responses']['200']['content']['application/json'];
export type UpdateProfileRequest =
  paths['/api/v1/users/me']['put']['requestBody']['content']['application/json'];
export type UpdateProfileResponse =
  paths['/api/v1/users/me']['put']['responses']['200']['content']['application/json'];
export type ChangePasswordRequest =
  paths['/api/v1/users/me/password']['put']['requestBody']['content']['application/json'];
export type ChangePasswordResponse =
  paths['/api/v1/users/me/password']['put']['responses']['200']['content']['application/json'];

export class UserApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'UserApiError';
    Object.setPrototypeOf(this, UserApiError.prototype);
  }
}

function getHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

const base = () => getApiBaseUrl();

/**
 * API-001: プロフィール取得
 */
export async function fetchProfile(token: string | null): Promise<GetProfileResponse> {
  const res = await fetch(`${base()}/api/v1/users/me`, {
    headers: getHeaders(token),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new UserApiError(`API-001 failed: ${res.status}`, res.status);
  }
  return res.json();
}

/**
 * API-002: プロフィール更新
 */
export async function updateProfile(
  token: string | null,
  body: UpdateProfileRequest,
): Promise<UpdateProfileResponse> {
  const res = await fetch(`${base()}/api/v1/users/me`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new UserApiError(`API-002 failed: ${res.status}`, res.status);
  }
  return res.json();
}

/**
 * API-003: パスワード変更（Request は GenericWriteRequest。仮実装で currentPassword / newPassword 等を送信）
 */
export async function changePassword(
  token: string | null,
  body: ChangePasswordRequest,
): Promise<ChangePasswordResponse> {
  const res = await fetch(`${base()}/api/v1/users/me/password`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new UserApiError(`API-003 failed: ${res.status}`, res.status);
  }
  return res.json();
}
