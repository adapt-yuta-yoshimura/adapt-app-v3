'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageSquare,
  CreditCard,
  Key,
  ClipboardList,
  LogOut,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@adapt/ui';
import { GlobalRole } from '@adapt/shared';

import { useAdminAuth } from '@/hooks/use-admin-auth';

/**
 * ナビ項目（§2-A-1 / Figma デザイン準拠）
 * 幅 240px、背景 #1E1E2D、テキスト #A2A3B7、アクティブ #4F46E5
 */
interface NavItemConfig {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: readonly GlobalRole[];
}

interface NavGroup {
  group: string;
  items: NavItemConfig[];
}

const adminNavGroups: NavGroup[] = [
  {
    group: 'メイン',
    items: [
      {
        href: '/dashboard',
        label: 'ダッシュボード',
        icon: LayoutDashboard,
        roles: [GlobalRole.OPERATOR, GlobalRole.ROOT_OPERATOR],
      },
    ],
  },
  {
    group: '管理',
    items: [
      { href: '/users', label: 'ユーザー管理', icon: Users, roles: [GlobalRole.OPERATOR, GlobalRole.ROOT_OPERATOR] },
      { href: '/courses', label: 'コース管理', icon: BookOpen, roles: [GlobalRole.OPERATOR, GlobalRole.ROOT_OPERATOR] },
      { href: '/payments', label: '決済管理', icon: CreditCard, roles: [GlobalRole.OPERATOR, GlobalRole.ROOT_OPERATOR] },
      { href: '/channels', label: 'チャンネル管理', icon: MessageSquare, roles: [GlobalRole.OPERATOR, GlobalRole.ROOT_OPERATOR] },
    ],
  },
  {
    group: 'システム',
    items: [
      { href: '/operators', label: '運営スタッフ', icon: Key, roles: [GlobalRole.ROOT_OPERATOR] },
      { href: '/audit', label: '監査ログ', icon: ClipboardList, roles: [GlobalRole.OPERATOR, GlobalRole.ROOT_OPERATOR] },
    ],
  },
];

const CURRENT_ADMIN_ROLE: GlobalRole = GlobalRole.ROOT_OPERATOR;

function canShowItem(roles: readonly GlobalRole[]): boolean {
  return roles.includes(CURRENT_ADMIN_ROLE);
}

export function AdminSidebar(): React.ReactNode {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-sidebar flex-col bg-sidebar-bg"
      role="navigation"
      aria-label="管理メニュー"
    >
      <div className="flex h-header shrink-0 items-center border-b border-white/10 px-6">
        <Link
          href="/dashboard"
          className="text-heading font-bold text-white transition-colors hover:opacity-90"
        >
          adapt
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-6">
          {adminNavGroups.map(({ group, items }) => {
            const visibleItems = items.filter((item) => canShowItem(item.roles));
            if (visibleItems.length === 0) return null;

            return (
              <li key={group}>
                <p
                  className="mb-2 px-3 text-nav-group font-bold uppercase tracking-wider text-sidebar-text"
                  aria-hidden
                >
                  {group}
                </p>
                <ul className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive =
                      pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3 rounded-input px-3 py-2.5 text-body-sm font-medium transition-colors',
                            isActive
                              ? 'bg-sidebar-active text-white'
                              : 'text-sidebar-text hover:bg-white/5 hover:text-white',
                          )}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <Icon className="h-5 w-5 shrink-0" aria-hidden />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-white/10 p-4">
        <button
          type="button"
          onClick={() => void logout()}
          className="flex w-full items-center gap-3 rounded-input px-3 py-2.5 text-body-sm font-medium text-sidebar-text transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden />
          ログアウト
        </button>
      </div>
    </aside>
  );
}
