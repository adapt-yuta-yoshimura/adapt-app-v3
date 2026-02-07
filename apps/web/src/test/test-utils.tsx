import { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * テスト用の QueryClient を作成する
 * テストごとにリトライを無効化してエラーを即座に検出
 */
function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * テスト用のプロバイダーラッパー
 */
function createWrapper(): React.FC<{ children: React.ReactNode }> {
  const queryClient = createTestQueryClient();

  return function Wrapper({ children }: { children: React.ReactNode }): ReactElement {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

/**
 * カスタム render 関数
 * QueryClientProvider でラップした状態でコンポーネントをレンダリング
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): ReturnType<typeof render> {
  return render(ui, { wrapper: createWrapper(), ...options });
}

// re-export everything
export * from '@testing-library/react';
export { customRender as render, createTestQueryClient };
