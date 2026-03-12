/**
 * 認証スタブ — 本格 OIDC 実装は別チケット
 * 現在は API-001 (GET /api/v1/users/me) を呼んで UserContext にセットするのみ
 * JWT トークンは環境変数 NEXT_PUBLIC_STUB_TOKEN で暫定設定
 */

import type { paths } from '@adapt/types/openapi-app';

type UserMeView =
  paths['/api/v1/users/me']['get']['responses']['200']['content']['application/json'];

export interface AuthUser {
  id: string;
  globalRole: 'guest' | 'learner' | 'instructor' | 'operator' | 'root_operator';
  name: string | null;
  email: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * globalRole による講師モードアクセス可否
 */
export function canAccessInstructorMode(role: string): boolean {
  return role === 'instructor';
}

/**
 * globalRole による受講者モードアクセス可否
 */
export function canAccessLearnerMode(role: string): boolean {
  return role === 'learner' || role === 'instructor';
}

/**
 * API-001: プロフィール取得（認証スタブ用）
 * トークンは Cookie または環境変数から取得
 */
export async function fetchCurrentUser(token: string | null): Promise<AuthUser | null> {
  const t = token ?? process.env.NEXT_PUBLIC_STUB_TOKEN ?? null;
  if (!t) {
    return null;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${t}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as UserMeView;
    return {
      id: data.id,
      globalRole: data.globalRole,
      name: data.name ?? null,
      email: data.email ?? null,
    };
  } catch {
    return null;
  }
}
