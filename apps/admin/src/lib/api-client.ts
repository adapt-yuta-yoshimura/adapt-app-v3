/**
 * Admin API クライアント基盤（ADMIN-00）
 *
 * - 型: @adapt/types/openapi-admin から取得すること
 * - 認証: クッキー（admin_token）は BFF プロキシ経由で送信する想定
 * - openapi-app の型は Admin で使用禁止（.cursorrules §19.7）
 */

const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') return '';
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';
};

export interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Admin API を呼び出す fetch ラッパー
 * 同一オリジンで BFF プロキシ（/api/admin/...）を使う場合は credentials: 'include' でクッキー送信
 */
export async function adminApiFetch<T>(
  path: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  const base = getBaseUrl();
  // BFFプロキシ: /api/admin/{path} → localhost:4000/{path}
  // path は /api/v1/admin/... 形式なので先頭の / を除去して渡す
  const proxyPath = path.startsWith('/') ? path.slice(1) : path;
  const url = path.startsWith('http') ? path : `${base}/api/admin/${proxyPath}`;

  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body != null ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `Admin API ${res.status}: ${text}`;
    try {
      const parsed = JSON.parse(text) as { message?: string };
      if (typeof parsed?.message === 'string' && parsed.message) {
        message = parsed.message;
      }
    } catch {
      // use default message
    }
    throw new Error(message);
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return res.json() as Promise<T>;
  }
  return undefined as unknown as T;
}
