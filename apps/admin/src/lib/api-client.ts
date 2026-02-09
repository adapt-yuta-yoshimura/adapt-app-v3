'use client';

import axios, { type AxiosError } from 'axios';

import { refreshAccessToken } from '@/lib/auth-config';
import { useAdminAuthStore } from '@/stores/auth.store';

export const adminApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://app.localhost.adapt:4000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** リクエストインターセプター: in-memory トークンを付与 */
adminApiClient.interceptors.request.use(
  (config) => {
    if (typeof window === 'undefined') return config;
    const token = useAdminAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/** レスポンスインターセプター: 401 時に Keycloak token endpoint で refresh（single-flight）。invalid_grant 時は即ログアウト */
adminApiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest || error.response?.status !== 401 || (originalRequest as { _retry?: boolean })._retry) {
      return Promise.reject(error);
    }

    if (typeof window === 'undefined') {
      return Promise.reject(error);
    }

    (originalRequest as { _retry?: boolean })._retry = true;

    const { refreshToken, setTokens, clearAuth } = useAdminAuthStore.getState();
    if (!refreshToken) {
      clearAuth();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      const tokens = await refreshAccessToken(refreshToken);
      if (tokens === null) {
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      const current = useAdminAuthStore.getState();
      setTokens({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? current.refreshToken ?? null,
        idToken: tokens.id_token ?? current.idToken ?? null,
      });
      originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
      return adminApiClient(originalRequest);
    } catch {
      clearAuth();
      window.location.href = '/login';
      return Promise.reject(error);
    }
  },
);
