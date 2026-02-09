'use client';

import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '@adapt/ui';

import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useAdminTitleValue } from '@/contexts/admin-title-context';

/**
 * Admin ヘッダー（§2-A-2）
 * 高さ 64px、背景 white、左: ページタイトル、右: 通知ベル + ユーザーアバター
 */
export function AdminHeader(): React.ReactNode {
  const { user } = useAdminAuth();
  const title = useAdminTitleValue();

  return (
    <header className="flex h-header shrink-0 items-center border-b border-border bg-surface-white px-6">
      <h2 className="text-heading font-semibold text-text-primary">{title}</h2>
      <div className="ml-auto flex items-center gap-4">
        <button
          type="button"
          className="rounded-full p-2 text-text-secondary transition-colors hover:bg-iris-10 hover:text-text-primary"
          aria-label="通知"
        >
          <Bell className="h-5 w-5" aria-hidden />
        </button>
        {user ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 rounded-full border border-border">
              <AvatarFallback className="text-body-sm font-medium text-iris-100 bg-iris-10">
                {user.displayName?.charAt(0).toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : null}
      </div>
    </header>
  );
}
