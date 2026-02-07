'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { adminApiClient } from '@/lib/api-client';
import { useAdminAuthStore } from '@/stores/auth.store';

interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

export function useAdminAuth(): {
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AdminUser | null;
} {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser, logout: clearAuth } = useAdminAuthStore();

  const login = useCallback(
    async (data: LoginRequest): Promise<void> => {
      const { data: response } = await adminApiClient.post<LoginResponse>(
        '/api/v1/auth/admin/login',
        data,
      );

      localStorage.setItem('admin_access_token', response.accessToken);
      localStorage.setItem('admin_refresh_token', response.refreshToken);
      setUser(response.user);
      router.push('/dashboard');
    },
    [setUser, router],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await adminApiClient.post('/api/v1/auth/logout');
    } finally {
      clearAuth();
      router.push('/login');
    }
  }, [clearAuth, router]);

  return { login, logout, isAuthenticated, isLoading, user };
}
