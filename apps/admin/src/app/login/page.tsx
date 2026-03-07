'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

/**
 * ADM-UI-01: 運営ログイン画面
 *
 * - Path: /login
 * - Figma: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8343-19&m=dev
 * - 動作: ログインボタン押下 → auth.adapt-co.io へ OIDCリダイレクト → 認証後 /admin/dashboard へ遷移
 * - ロール: operator, root_operator のみログイン可能
 * - returnUrl: 401 リダイレクト時は returnUrl パラメータ、middleware リダイレクト時は from パラメータで復帰先を保持
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageSkeleton() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-text">adapt Admin</h1>
        <p className="mt-1 text-sm text-textTertiary">管理者ログイン</p>
      </div>
    </main>
  );
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  // returnUrl: 401 リダイレクト時（api-client.ts から）
  // from: middleware リダイレクト時（middleware.ts から）
  const returnUrl = searchParams.get('returnUrl') ?? searchParams.get('from') ?? null;

  const issuer = process.env.NEXT_PUBLIC_AUTH_ISSUER ?? 'https://auth.adapt-co.io/realms/adapt';
  const clientId = process.env.NEXT_PUBLIC_AUTH_CLIENT_ID ?? 'admin';
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/callback`
    : 'http://localhost:3001/callback';

  const authUrl = new URL(`${issuer}/protocol/openid-connect/auth`);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid profile email');

  async function handleLogin() {
    // returnUrl を Cookie に保存（OIDC リダイレクトフローで URL パラメータが失われるため）
    if (returnUrl && returnUrl.startsWith('/admin/')) {
      document.cookie = `admin_return_url=${encodeURIComponent(returnUrl)}; path=/; max-age=600; samesite=lax`;
    }

    // PKCE: code_verifier生成
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const codeVerifier = btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    // code_challenge生成（S256）
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    // state にcode_verifierを含める（Server Sideのcallbackで使用）
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', codeVerifier);
    window.location.href = authUrl.toString();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-text">adapt Admin</h1>
        <p className="mt-1 text-sm text-textTertiary">管理者ログイン</p>
        {returnUrl && (
          <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
            セッションが期限切れになりました。再度ログインしてください。
          </p>
        )}
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
