'use client';

import { create } from 'zustand';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

interface AdminAuthState {
  /** in-memory のみ。localStorage / sessionStorage にトークンは保存しない */
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setTokens: (params: {
    accessToken: string;
    refreshToken: string | null;
    idToken: string | null;
  }) => void;
  setUser: (user: AdminUser) => void;
  setLoading: (loading: boolean) => void;
  /** トークン・ユーザーを破棄（in-memory のみクリア） */
  clearAuth: () => void;
  /** ログアウト: clearAuth のエイリアス（AuthGuard 等で利用） */
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  idToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setTokens: (params) =>
    set({
      accessToken: params.accessToken,
      refreshToken: params.refreshToken ?? null,
      idToken: params.idToken ?? null,
    }),
  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () =>
    set({
      accessToken: null,
      refreshToken: null,
      idToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
  logout: () =>
    set({
      accessToken: null,
      refreshToken: null,
      idToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
