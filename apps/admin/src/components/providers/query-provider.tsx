'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { UnauthorizedError } from '@/lib/api-client';

/**
 * TanStack Query プロバイダー
 *
 * 401 エラー（UnauthorizedError）はリトライしない:
 * - トークン期限切れは再リクエストしても成功しない
 * - api-client.ts 側で /login へのリダイレクトが行われる
 * - mutation でも同様に 401 リトライを抑制
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: (failureCount, error) => {
              // 401 (UnauthorizedError) はリトライしない
              if (error instanceof UnauthorizedError) return false;
              // その他のエラーは最大3回リトライ（デフォルト動作）
              return failureCount < 3;
            },
          },
          mutations: {
            retry: (failureCount, error) => {
              // 401 (UnauthorizedError) はリトライしない
              if (error instanceof UnauthorizedError) return false;
              // mutation はデフォルトでリトライなし
              return false;
            },
          },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
