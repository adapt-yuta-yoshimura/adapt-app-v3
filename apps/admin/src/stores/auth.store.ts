'use client';

import { create } from 'zustand';

interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

interface AdminAuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AdminUser) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user: AdminUser): void =>
    set({ user, isAuthenticated: true, isLoading: false }),
  setLoading: (isLoading: boolean): void => set({ isLoading }),
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
