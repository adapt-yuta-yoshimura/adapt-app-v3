'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';

/** ログインリクエスト */
interface LoginRequest {
  email: string;
  password: string;
}

/** ログインレスポンス */
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

/** ユーザー情報 */
interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

/**
 * 認証操作のカスタムフック
 * ログイン・ログアウト・Google認証を提供
 */
export function useAuth(): {
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
} {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser, logout: clearAuth } = useAuthStore();

  const login = useCallback(
    async (data: LoginRequest): Promise<void> => {
      const { data: response } = await apiClient.post<LoginResponse>(
        '/api/v1/auth/login',
        data,
      );

      localStorage.setItem('access_token', response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);
      setUser(response.user);
      router.push('/dashboard');
    },
    [setUser, router],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } finally {
      clearAuth();
      router.push('/login');
    }
  }, [clearAuth, router]);

  const loginWithGoogle = useCallback((): void => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ?? 'http://app.localhost.adapt:4000';
    window.location.href = `${apiUrl}/api/v1/auth/google`;
  }, []);

  return { login, logout, loginWithGoogle, isAuthenticated, isLoading, user };
}
