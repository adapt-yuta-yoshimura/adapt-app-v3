'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-sidebar">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-9 rounded-2xl border border-border bg-card py-12 px-10 shadow-[0_8px_32px_rgba(0,0,0,0.2),0_2px_8px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/70 text-xl font-bold text-white">
            a
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">adapt</h1>
          <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
            管理コンソール
          </span>
        </div>
        <div className="h-px w-full bg-border" />
        <p className="text-sm text-textTertiary">管理者ログイン</p>
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
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-sidebar">
      {/* Subtle grid pattern (Figma batch1) */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#94A3B8 1px, transparent 1px), linear-gradient(90deg, #94A3B8 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute right-[15%] top-[10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12),transparent_70%)]" />
      <div className="absolute bottom-[5%] left-[10%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08),transparent_70%)]" />

      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center gap-9 rounded-2xl border border-border bg-card py-12 px-10 shadow-[0_8px_32px_rgba(0,0,0,0.2),0_2px_8px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-[#1D4ED8] text-xl font-bold tracking-tight text-white">
            a
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">adapt</h1>
          <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
            管理コンソール
          </span>
        </div>
        <div className="h-px w-full bg-border" />
        <div className="flex w-full max-w-[340px] flex-col items-center gap-6">
          <p className="text-center text-sm leading-relaxed tracking-wide text-textTertiary">
            SSOアカウントで管理画面にログインします
          </p>
          <button
            type="button"
            onClick={handleLogin}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 px-4 text-[15px] font-semibold tracking-wide text-white shadow-[0_2px_8px_rgba(59,130,246,0.25)] transition-all duration-200 hover:-translate-y-px hover:bg-[#2563EB] hover:shadow-[0_8px_24px_rgba(59,130,246,0.35)]"
          >
            <Lock className="h-[18px] w-[18px] shrink-0" />
            管理画面にログイン
          </button>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-center text-xs leading-relaxed tracking-wide text-textMuted">
            auth.adapt-co.io で認証を行います
          </p>
          <Link href="/" className="text-xs text-textMuted underline hover:text-textTertiary">
            トップへ戻る
          </Link>
        </div>
        {returnUrl && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
            セッションが期限切れになりました。再度ログインしてください。
          </p>
        )}
      </div>
    </main>
  );
}
