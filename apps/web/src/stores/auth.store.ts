'use client';

import { create } from 'zustand';

/** ユーザー情報 */
interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

/** 認証ストア状態 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

/**
 * 認証状態のZustandストア
 * クライアントサイドの認証状態管理に使用
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
