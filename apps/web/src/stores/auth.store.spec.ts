import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';

import { useAuthStore } from './auth.store';

describe('useAuthStore', () => {
  beforeEach(() => {
    // ストアをリセット
    act(() => {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      });
    });
    localStorage.clear();
  });

  it('初期状態が正しい', () => {
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it('setUser でユーザー情報を設定できる', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@adapt-co.io',
      displayName: 'テストユーザー',
      avatarUrl: null,
    };

    act(() => {
      useAuthStore.getState().setUser(mockUser);
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('setLoading でローディング状態を更新できる', () => {
    act(() => {
      useAuthStore.getState().setLoading(false);
    });

    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('logout でユーザー情報をクリアしトークンを削除する', () => {
    // ユーザーをセット
    act(() => {
      useAuthStore.getState().setUser({
        id: 'user-1',
        email: 'test@adapt-co.io',
        displayName: 'テスト',
        avatarUrl: null,
      });
    });

    localStorage.setItem('access_token', 'test-token');
    localStorage.setItem('refresh_token', 'test-refresh');

    // ログアウト
    act(() => {
      useAuthStore.getState().logout();
    });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });
});
