'use client';

import { Sun, Moon } from 'lucide-react';
import { Button, Avatar, AvatarFallback } from '@adapt/ui';

import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useThemeStore } from '@/stores/theme.store';

/**
 * Admin ヘッダー（64px）
 * Phase 0: border-border, bg-surface-card, text-text-primary
 */
export function AdminHeader(): React.ReactNode {
  const { user, logout } = useAdminAuth();
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = (): void => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex h-header shrink-0 items-center border-b border-border bg-surface-card px-6">
      <h2 className="text-heading font-semibold text-text-primary">管理画面</h2>
      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label={theme === 'dark' ? 'ライトモードへ' : 'ダークモードへ'}>
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-text-secondary" aria-hidden />
          ) : (
            <Moon className="h-5 w-5 text-text-secondary" aria-hidden />
          )}
        </Button>
        {user ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-body-sm font-medium text-iris-100">
                {user.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-body-sm font-medium text-text-primary">{user.displayName}</p>
              <p className="text-caption text-text-secondary">{user.role}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => void logout()}>
              ログアウト
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <a href="/login">ログイン</a>
          </Button>
        )}
      </div>
    </header>
  );
}
