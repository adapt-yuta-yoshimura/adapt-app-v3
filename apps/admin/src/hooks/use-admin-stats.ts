'use client';

import { useQuery } from '@tanstack/react-query';

import { adminApiClient } from '@/lib/api-client';

interface AdminDashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalPayments: number;
  totalRevenue: number;
  recentUsers: Array<{
    id: string;
    email: string;
    displayName: string;
    createdAt: string;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    count: number;
  }>;
  usersByMonth: Array<{
    month: string;
    count: number;
  }>;
}

export function useAdminStats(): ReturnType<typeof useQuery<AdminDashboardStats>> {
  return useQuery<AdminDashboardStats>({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await adminApiClient.get<AdminDashboardStats>(
        '/api/v1/admin/dashboard/stats',
      );
      return data;
    },
  });
}
