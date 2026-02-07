'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect, type ReactNode } from 'react';

import { useThemeStore } from '@/stores/theme.store';

function ThemeInitializer(): null {
  const { setTheme } = useThemeStore();

  useEffect(() => {
    const saved = localStorage.getItem('admin-theme') as 'light' | 'dark' | 'system' | null;
    if (saved) {
      setTheme(saved);
    } else {
      setTheme('dark');
    }
  }, [setTheme]);

  return null;
}

export function Providers({ children }: { children: ReactNode }): ReactNode {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
