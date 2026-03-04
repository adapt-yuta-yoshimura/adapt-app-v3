'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Key,
  BookOpen,
  CreditCard,
} from 'lucide-react';

type GlobalRole = 'operator' | 'root_operator';

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: GlobalRole[];
}[] = [
  { href: '/admin/dashboard', label: 'ダッシュボード', icon: LayoutDashboard, roles: ['operator', 'root_operator'] },
  { href: '/admin/learners', label: '受講者管理', icon: Users, roles: ['operator', 'root_operator'] },
  { href: '/admin/instructors', label: '講師管理', icon: GraduationCap, roles: ['operator', 'root_operator'] },
  { href: '/admin/operators', label: '運営スタッフ', icon: Key, roles: ['root_operator'] },
  { href: '/admin/courses', label: '講座管理', icon: BookOpen, roles: ['operator', 'root_operator'] },
  { href: '/admin/finance/overview', label: '売上・決済', icon: CreditCard, roles: ['operator', 'root_operator'] },
];

interface AdminSidebarProps {
  globalRole: GlobalRole | null;
}

export function AdminSidebar({ globalRole }: AdminSidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => globalRole && item.roles.includes(globalRole)
  );

  return (
    <aside
      className="fixed left-0 top-0 z-30 h-screen w-[240px] flex-shrink-0 bg-sidebar text-white"
      aria-label="管理メニュー"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b border-white/10 px-4">
          <Link href="/admin/dashboard" className="font-semibold text-white">
            adapt Admin
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
