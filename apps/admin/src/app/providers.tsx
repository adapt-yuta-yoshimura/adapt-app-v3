'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { usePathname } from 'next/navigation';
import { useState, useEffect, type ReactNode } from 'react';

import { useAdminAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';

const PUBLIC_PATHS = ['/login', '/callback'];

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

/**
 * クライアント Route Guard: /login, /callback 以外は認証必須。未認証時は /login へリダイレクト。
 * middleware は使わない（設計決定）
 */
function AuthGuard({ children }: { children: ReactNode }): ReactNode {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, setLoading } = useAdminAuthStore();

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (isPublic) return;
    if (isAuthenticated) return;
    setLoading(false);
    window.location.href = '/login';
  }, [isPublic, isAuthenticated, setLoading]);

  if (isPublic) {
    return <>{children}</>;
  }
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-body-sm text-text-secondary">リダイレクト中...</p>
      </div>
    );
  }
  return <>{children}</>;
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
      <AuthGuard>{children}</AuthGuard>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
