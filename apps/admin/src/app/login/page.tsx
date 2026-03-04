'use client';

import Link from 'next/link';

/**
 * ADM-UI-01: 運営ログイン画面
 *
 * - Path: /login
 * - Figma: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8343-19&m=dev
 * - 動作: ログインボタン押下 → auth.adapt-co.io へ OIDCリダイレクト → 認証後 /admin/dashboard へ遷移
 * - ロール: operator, root_operator のみログイン可能
 */
export default function LoginPage() {
  const issuer = process.env.NEXT_PUBLIC_AUTH_ISSUER ?? 'https://auth.adapt-co.io/realms/adapt';
  const clientId = process.env.NEXT_PUBLIC_AUTH_CLIENT_ID ?? 'admin';
  const redirectUri =
    typeof window !== 'undefined'
      ? `${window.location.origin}/callback`
      : process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/callback`
        : 'http://localhost:3001/callback';

  const authUrl = new URL(`${issuer}/protocol/openid-connect/auth`);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid profile email');

  function handleLogin() {
    window.location.href = authUrl.toString();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-text">adapt Admin</h1>
        <p className="mt-1 text-sm text-textTertiary">管理者ログイン</p>
        <p className="mt-6 text-sm text-textSecondary">
          auth.adapt-co.io（OIDC）で認証します。operator / root_operator のみログイン可能です。
        </p>
        <button
          type="button"
          onClick={handleLogin}
          className="mt-6 w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          管理者ログイン
        </button>
        <p className="mt-4 text-center text-xs text-textMuted">
          <Link href="/" className="underline hover:text-textTertiary">
            トップへ戻る
          </Link>
        </p>
      </div>
    </main>
  );
}
