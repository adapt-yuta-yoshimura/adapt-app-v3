'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  Key,
} from 'lucide-react';

type GlobalRole = 'operator' | 'root_operator';

/** 全ロールで表示するメニュー（Figma順: ダッシュボード → 受講者 → 講師 → 講座 → 売上・決済） */
const MAIN_NAV_ITEMS: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { href: '/admin/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/admin/learners', label: '受講者管理', icon: Users },
  { href: '/admin/instructors', label: '講師管理', icon: GraduationCap },
  { href: '/admin/courses', label: '講座管理', icon: BookOpen },
  { href: '/admin/finance/overview', label: '売上・決済', icon: CreditCard },
];

/** root_operator のみ表示（区切り線の下に ROOT バッジ付きで表示） */
const ROOT_NAV_ITEMS: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { href: '/admin/operators', label: '運営スタッフ', icon: Key },
];

interface AdminSidebarProps {
  globalRole: GlobalRole | null;
  userName?: string | null;
  roleLabel?: string;
}

export function AdminSidebar({ globalRole, userName, roleLabel }: AdminSidebarProps) {
  const pathname = usePathname();

  const showRootNav = globalRole === 'root_operator';

  return (
    <aside
      className="fixed left-0 top-0 z-30 flex h-screen w-[240px] flex-shrink-0 flex-col bg-[#0F172A]"
      aria-label="管理メニュー"
    >
      {/* 1-1. ロゴエリア（Figma準拠） */}
      <div className="flex h-16 shrink-0 items-center gap-[10px] border-b border-[#1e293b] pl-5">
        <Link href="/admin/dashboard" className="flex items-center gap-[10px]">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            }}
          >
            a
          </div>
          <span className="text-lg font-bold leading-none tracking-[-0.3px] text-white">
            adapt
          </span>
          <span className="rounded border border-[#334155] bg-[#1e293b] px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-[#3b82f6]">
            ADMIN
          </span>
        </Link>
      </div>

      {/* ナビゲーション */}
      <nav className="flex min-h-0 flex-1 flex-col pt-4">
        {/* メインメニュー（全ロール） */}
        <div className="flex flex-col gap-0.5">
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mx-2.5 flex h-[42px] items-center gap-[10px] rounded-lg px-3 text-[14px] tracking-[0.56px] transition-colors ${
                  isActive
                    ? 'bg-[#1e293b] font-bold text-[#e2e8f0]'
                    : 'font-normal text-[#94a3b8] hover:bg-[#1e293b]/50 hover:text-[#e2e8f0]'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* 1-2. 区切り線（売上・決済と運営スタッフの間） */}
        {showRootNav && (
          <>
            <div
              className="mx-[18px] my-3 h-px shrink-0 bg-[#1e293b]"
              aria-hidden
            />
            {/* 1-3. ROOT 限定メニュー（ROOT バッジ付き） */}
            <div className="flex flex-col gap-0.5">
              {ROOT_NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mx-2.5 flex h-[42px] items-center gap-[10px] rounded-lg px-3 text-[14px] tracking-[0.56px] transition-colors ${
                      isActive
                        ? 'bg-[#1e293b] font-bold text-[#e2e8f0]'
                        : 'font-normal text-[#94a3b8] hover:bg-[#1e293b]/50 hover:text-[#e2e8f0]'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="min-w-0 flex-1">{item.label}</span>
                    <span className="shrink-0 text-[9px] font-medium tracking-[0.56px] text-[#3b82f6]">
                      ROOT
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* 1-6. ユーザー情報エリア（下部・Figma準拠） */}
      <div className="flex h-[65px] shrink-0 items-center gap-[10px] border-t border-[#1e293b] px-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e293b] text-xs font-bold text-[#e2e8f0]">
          {userName ? userName.slice(0, 1) : '?'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium leading-tight text-[#e2e8f0]">
            {userName ?? '—'}
          </p>
          <p className="text-[11px] leading-tight text-[#3b82f6]">
            {roleLabel ?? (globalRole === 'root_operator' ? 'Root Operator' : 'Operator')}
          </p>
        </div>
      </div>
    </aside>
  );
}
