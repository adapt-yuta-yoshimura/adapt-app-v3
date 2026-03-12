'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  PenSquare,
  ChevronsLeft,
} from 'lucide-react';
import { ModeSwitcher } from './ModeSwitcher';

const NAV_ITEMS = [
  { label: 'ホーム', href: '/instructor/dashboard', icon: Home },
  { label: '講座管理一覧', href: '/instructor/courses', icon: BookOpen },
  { label: '受講者管理', href: '/instructor/students', icon: Users },
  { label: '収益管理', href: '/instructor/analytics', icon: BarChart3 },
  { label: '設定', href: '/instructor/settings', icon: Settings },
] as const;

export function InstructorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-[188px] flex-col border-r border-iris-60 bg-iris-bg">
      <div className="flex items-center gap-2 px-2 pt-4">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center text-grey3"
          aria-label="サイドバーを折りたたむ"
        >
          <ChevronsLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-bold text-black">講師用マイページ</span>
      </div>

      <nav className="mt-6 flex w-[171px] flex-col gap-0.5 px-2" aria-label="講師メニュー">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== '/instructor/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded px-2 py-2 text-sm tracking-[0.56px] ${
                isActive ? 'bg-iris-light text-black' : 'text-grey3'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex flex-col gap-2 px-2">
        <span className="text-xs font-bold text-iris-100">開催中のブートキャンプ</span>
        <ul className="flex flex-col gap-2 text-xs text-grey3 opacity-60">
          <li>（コース名は後続でAPI連携）</li>
        </ul>
        <Link
          href="/instructor/courses/new"
          className="mt-2 flex items-center justify-center gap-2 rounded bg-iris-100 px-3 py-[11px] text-sm font-normal text-white"
        >
          <PenSquare className="h-5 w-5" />
          講座を作る
        </Link>
      </div>

      <div className="mt-auto px-2 pb-6">
        <ModeSwitcher currentMode="instructor" />
      </div>
    </aside>
  );
}
