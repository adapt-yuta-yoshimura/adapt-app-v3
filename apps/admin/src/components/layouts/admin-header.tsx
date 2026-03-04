'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';

/**
 * パスからパンくずラベルを生成（簡易）
 */
function getBreadcrumb(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return 'ダッシュボード';
  const map: Record<string, string> = {
    admin: '',
    dashboard: 'ダッシュボード',
    learners: '受講者管理',
    instructors: '講師管理',
    operators: '運営スタッフ',
    courses: '講座管理',
    finance: '売上・決済',
    overview: '概要',
    new: '新規',
  };
  const last = segments[segments.length - 1];
  if (last && !map[last] && last.length > 20) return '詳細';
  return map[last] ?? last;
}

interface AdminHeaderProps {
  userName: string | null;
}

export function AdminHeader({ userName }: AdminHeaderProps) {
  const pathname = usePathname();
  const breadcrumb = getBreadcrumb(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="text-sm text-textTertiary">
        <Link href="/admin/dashboard" className="hover:text-textSecondary">
          Admin
        </Link>
        <span className="mx-2">/</span>
        <span className="text-textSecondary">{breadcrumb}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-textSecondary">{userName ?? '管理者'}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-border">
          <User className="h-4 w-4 text-textTertiary" />
        </div>
      </div>
    </header>
  );
}
