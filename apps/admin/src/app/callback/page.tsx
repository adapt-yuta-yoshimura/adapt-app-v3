'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import {
  decodeJwtPayload,
  exchangeCodeForTokens,
  type IdTokenPayload,
  userFromIdTokenPayload,
} from '@/lib/auth-config';
import { useAdminAuthStore } from '@/stores/auth.store';

const SESSION_KEY_STATE = 'oidc_state';
const SESSION_KEY_NONCE = 'oidc_nonce';
const SESSION_KEY_CODE_VERIFIER = 'oidc_code_verifier';

function CallbackContent(): React.ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { setTokens, setUser, clearAuth } = useAdminAuthStore();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      setError('code または state がありません');
      router.replace('/login');
      return;
    }

    const storedState = typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_KEY_STATE) : null;
    const storedNonce = typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_KEY_NONCE) : null;
    const codeVerifier = typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_KEY_CODE_VERIFIER) : null;

    if (!storedState || !storedNonce || !codeVerifier) {
      clearAuth();
      router.replace('/login');
      return;
    }

    if (state !== storedState) {
      clearAuth();
      router.replace('/login');
      return;
    }

    exchangeCodeForTokens(code, codeVerifier)
      .then((tokens) => {
        if (!tokens.id_token) {
          clearAuth();
          router.replace('/login');
          return;
        }

        const payload = decodeJwtPayload<IdTokenPayload>(tokens.id_token);
        if (payload.nonce !== storedNonce) {
          clearAuth();
          router.replace('/login');
          return;
        }

        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(SESSION_KEY_STATE);
          sessionStorage.removeItem(SESSION_KEY_NONCE);
          sessionStorage.removeItem(SESSION_KEY_CODE_VERIFIER);
        }

        setTokens({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token ?? null,
          idToken: tokens.id_token ?? null,
        });
        setUser(userFromIdTokenPayload(payload));
        router.replace('/dashboard');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Token exchange failed');
        clearAuth();
        router.replace('/login');
      });
  }, [searchParams, router, setTokens, setUser, clearAuth]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-body-sm text-text-secondary">認証中にエラーが発生しました。ログインへ戻ります。</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-body-sm text-text-secondary">認証中...</p>
    </div>
  );
}

/**
 * OIDC callback: code 受取 → state 検証 → nonce 検証 → token 交換 → in-memory 保存 → /dashboard
 * nonce 不一致時は認証失敗扱いで /login へリダイレクト
 */
export default function CallbackPage(): React.ReactNode {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-body-sm text-text-secondary">認証中...</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
