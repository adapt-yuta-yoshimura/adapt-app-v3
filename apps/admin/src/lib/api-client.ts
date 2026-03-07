/**
 * Admin API クライアント基盤（ADMIN-00）
 *
 * - 型: @adapt/types/openapi-admin から取得すること
 * - 認証: クッキー（admin_token）は BFF プロキシ経由で送信する想定
 * - openapi-app の型は Admin で使用禁止（.cursorrules §19.7）
 * - 401 レスポンス時は /login へ自動リダイレクト（トークン期限切れ対応）
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
 * 401 Unauthorized 用のカスタムエラー
 * TanStack Query の retry 判定で使用する
 */
export class UnauthorizedError extends Error {
  public readonly status = 401;
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 401 レスポンス時に /login へリダイレクトする
 * - /login, /callback ページではリダイレクトしない（ループ防止）
 * - SSR 環境（window なし）ではリダイレクトしない
 * - returnUrl で元のページパスを保持する
 */
function redirectToLoginOn401(): void {
  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname;
  // /login, /callback でのリダイレクトループを防止
  if (currentPath === '/login' || currentPath.startsWith('/callback')) {
    return;
  }

  const loginUrl = new URL('/login', window.location.origin);
  // 現在のパス + クエリ文字列を returnUrl として保存
  const returnUrl = currentPath + window.location.search;
  if (returnUrl && returnUrl !== '/') {
    loginUrl.searchParams.set('returnUrl', returnUrl);
  }
  window.location.href = loginUrl.toString();
}

/**
 * Admin API を呼び出す fetch ラッパー
 * 同一オリジンで BFF プロキシ（/api/admin/...）を使う場合は credentials: 'include' でクッキー送信
 * 401 レスポンス時は自動的に /login へリダイレクトする
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
    // 401: トークン期限切れ → /login へリダイレクト
    if (res.status === 401) {
      redirectToLoginOn401();
      throw new UnauthorizedError('Unauthorized: session expired');
    }

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
