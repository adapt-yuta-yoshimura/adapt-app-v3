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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@adapt/ui';
import { PlatformRole } from '@adapt/shared';

/**
 * ナビ項目（§3.2 準拠）
 * roles は PlatformRole に準拠。root_operator のみの項目は非該当時に非表示。
 */
interface NavItemConfig {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: readonly PlatformRole[];
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
        roles: [PlatformRole.OPERATOR, PlatformRole.ROOT_OPERATOR],
      },
    ],
  },
  {
    group: '管理',
    items: [
      { href: '/courses', label: 'コース管理', icon: BookOpen, roles: [PlatformRole.OPERATOR, PlatformRole.ROOT_OPERATOR] },
      { href: '/users', label: 'ユーザー管理', icon: Users, roles: [PlatformRole.OPERATOR, PlatformRole.ROOT_OPERATOR] },
      { href: '/channels', label: 'チャンネル管理', icon: MessageSquare, roles: [PlatformRole.OPERATOR, PlatformRole.ROOT_OPERATOR] },
      { href: '/payments', label: '決済管理', icon: CreditCard, roles: [PlatformRole.OPERATOR, PlatformRole.ROOT_OPERATOR] },
    ],
  },
  {
    group: 'システム',
    items: [
      { href: '/operators', label: '運営スタッフ', icon: Key, roles: [PlatformRole.ROOT_OPERATOR] },
      { href: '/audit', label: '監査ログ', icon: ClipboardList, roles: [PlatformRole.OPERATOR, PlatformRole.ROOT_OPERATOR] },
    ],
  },
];

/**
 * 現在の運営ロール（認証連携前はハードコード。後日 useAdminAuth 等で差し替え）
 */
const CURRENT_ADMIN_ROLE: PlatformRole = PlatformRole.ROOT_OPERATOR;

function canShowItem(roles: readonly PlatformRole[]): boolean {
  return roles.includes(CURRENT_ADMIN_ROLE);
}

export function AdminSidebar(): React.ReactNode {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-sidebar flex-col border-r border-border bg-surface-card"
      role="navigation"
      aria-label="管理メニュー"
    >
      {/* ロゴ・アプリ名 */}
      <div className="flex h-header shrink-0 items-center border-b border-border px-6">
        <Link
          href="/dashboard"
          className="text-heading font-bold text-text-primary transition-colors hover:text-iris-100"
        >
          adapt Admin
        </Link>
      </div>

      {/* ナビグループ */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-6">
          {adminNavGroups.map(({ group, items }) => {
            const visibleItems = items.filter((item) => canShowItem(item.roles));
            if (visibleItems.length === 0) return null;

            return (
              <li key={group}>
                <p
                  className="mb-2 px-3 text-nav-group font-bold uppercase tracking-wider text-text-secondary"
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
                              ? 'bg-iris-100/10 text-iris-100'
                              : 'text-text-secondary hover:bg-iris-10 hover:text-text-primary',
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

      {/* フッター */}
      <div className="shrink-0 border-t border-border p-4">
        <p className="text-caption text-text-secondary">adapt Admin v1.0</p>
      </div>
    </aside>
  );
}
