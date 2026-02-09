'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

import {
  buildAuthorizationUrl,
  buildLogoutUrl,
  generateCodeChallenge,
  generateCodeVerifier,
  generateNonce,
  generateState,
} from '@/lib/auth-config';
import { useAdminAuthStore } from '@/stores/auth.store';

const SESSION_KEY_STATE = 'oidc_state';
const SESSION_KEY_NONCE = 'oidc_nonce';
const SESSION_KEY_CODE_VERIFIER = 'oidc_code_verifier';

export type AdminUser = import('@/stores/auth.store').AdminUser;

export function useAdminAuth(): {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AdminUser | null;
} {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, idToken, clearAuth } = useAdminAuthStore();

  const login = useCallback(async (): Promise<void> => {
    const state = generateState();
    const nonce = generateNonce();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(SESSION_KEY_STATE, state);
      sessionStorage.setItem(SESSION_KEY_NONCE, nonce);
      sessionStorage.setItem(SESSION_KEY_CODE_VERIFIER, codeVerifier);
    }

    const url = buildAuthorizationUrl({ state, nonce, codeChallenge });
    window.location.href = url;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    const redirectUri =
      typeof window !== 'undefined'
        ? `${window.location.origin}/login`
        : process.env.NEXT_PUBLIC_ADMIN_URL
          ? `${process.env.NEXT_PUBLIC_ADMIN_URL}/login`
          : undefined;
    const logoutUrl = buildLogoutUrl({
      idTokenHint: idToken ?? undefined,
      postLogoutRedirectUri: redirectUri,
    });
    clearAuth();
    window.location.href = logoutUrl;
  }, [clearAuth, idToken]);

  return { login, logout, isAuthenticated, isLoading, user };
}
