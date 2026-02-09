/**
 * Admin User Freeze/Unfreeze API Hooks
 * API-075: ユーザー凍結
 * API-075B: ユーザー凍結解除
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApiClient } from '@/lib/api-client';
import type { GenericWriteRequest, SuccessResponse } from '@/types';

/**
 * ユーザー凍結 (API-075)
 * POST /api/v1/admin/users/:userId/freeze
 */
export function useFreezeUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      reason,
    }: {
      userId: string;
      reason: string;
    }): Promise<SuccessResponse> => {
      const body: GenericWriteRequest = { reason };
      const response = await adminApiClient.post<SuccessResponse>(
        `/api/v1/admin/users/${userId}/freeze`,
        body,
      );
      return response.data;
    },
    onSuccess: () => {
      // ユーザー一覧を再取得
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/**
 * ユーザー凍結解除 (API-075B)
 * POST /api/v1/admin/users/:userId/unfreeze
 */
export function useUnfreezeUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      reason,
    }: {
      userId: string;
      reason: string;
    }): Promise<SuccessResponse> => {
      const body: GenericWriteRequest = { reason };
      const response = await adminApiClient.post<SuccessResponse>(
        `/api/v1/admin/users/${userId}/unfreeze`,
        body,
      );
      return response.data;
    },
    onSuccess: () => {
      // ユーザー一覧を再取得
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
