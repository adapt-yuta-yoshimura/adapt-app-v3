'use client';

import { useQuery } from '@tanstack/react-query';

import { adminApiClient } from '@/lib/api-client';
import type { UserListResponse } from '@/types';

export function useAdminUsers(
  page: number = 1,
  limit: number = 20,
  q?: string,
  role?: string,
  status?: string,
): ReturnType<typeof useQuery<UserListResponse>> {
  return useQuery<UserListResponse>({
    queryKey: ['admin', 'users', page, limit, q, role, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (q) params.set('q', q);
      if (role) params.set('role', role);
      if (status) params.set('status', status);
      const { data } = await adminApiClient.get<UserListResponse>(
        `/api/v1/admin/users?${params.toString()}`,
      );
      return data;
    },
  });
}
