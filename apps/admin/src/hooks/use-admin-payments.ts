'use client';

import { useQuery } from '@tanstack/react-query';

import { adminApiClient } from '@/lib/api-client';

interface AdminPaymentItem {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface AdminPaymentsResponse {
  items: AdminPaymentItem[];
  meta: {
    total: number;
    page: { currentPage: number; totalPages: number; perPage: number };
  };
}

export function useAdminPayments(
  page: number = 1,
  limit: number = 20,
  status?: string,
): ReturnType<typeof useQuery<AdminPaymentsResponse>> {
  return useQuery<AdminPaymentsResponse>({
    queryKey: ['admin', 'payments', page, limit, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (status) params.set('status', status);
      const { data } = await adminApiClient.get<AdminPaymentsResponse>(
        `/api/v1/admin/payments?${params.toString()}`,
      );
      return data;
    },
  });
}
