/**
 * Admin Operators API Hooks
 * API-076: 運営スタッフ一覧
 * API-077: 運営スタッフ追加
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApiClient } from '@/lib/api-client';
import type { OperatorListResponse, GenericWriteRequest, SuccessResponse } from '@/types';

/**
 * 運営スタッフ一覧取得 (API-076)
 * GET /api/v1/admin/operators
 */
export function useAdminOperators() {
  return useQuery({
    queryKey: ['admin', 'operators'],
    queryFn: async (): Promise<OperatorListResponse> => {
      const response = await adminApiClient.get<OperatorListResponse>(
        '/api/v1/admin/operators',
      );
      return response.data;
    },
  });
}

/**
 * 運営スタッフ追加 (API-077)
 * POST /api/v1/admin/operators
 */
export function useCreateOperator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GenericWriteRequest): Promise<SuccessResponse> => {
      const response = await adminApiClient.post<SuccessResponse>(
        '/api/v1/admin/operators',
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      // 運営スタッフ一覧を再取得
      queryClient.invalidateQueries({ queryKey: ['admin', 'operators'] });
    },
  });
}
