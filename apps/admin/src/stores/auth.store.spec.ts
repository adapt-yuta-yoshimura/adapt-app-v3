import { describe, it, expect, beforeEach } from 'vitest';
import { useAdminAuthStore } from './auth.store';

describe('useAdminAuthStore', () => {
  beforeEach(() => {
    useAdminAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
    localStorage.clear();
  });

  it('should have correct initial state', () => {
    const state = useAdminAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it('should set user and authenticate', () => {
    const mockUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      displayName: 'Admin User',
      role: 'super_admin',
    };

    useAdminAuthStore.getState().setUser(mockUser);
    const state = useAdminAuthStore.getState();

    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('should set loading state', () => {
    useAdminAuthStore.getState().setLoading(false);
    expect(useAdminAuthStore.getState().isLoading).toBe(false);

    useAdminAuthStore.getState().setLoading(true);
    expect(useAdminAuthStore.getState().isLoading).toBe(true);
  });

  it('should logout and clear state', () => {
    const mockUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      displayName: 'Admin User',
      role: 'super_admin',
    };

    useAdminAuthStore.getState().setUser(mockUser);
    useAdminAuthStore.getState().logout();

    const state = useAdminAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(localStorage.removeItem).toHaveBeenCalledWith('admin_access_token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('admin_refresh_token');
  });
});
