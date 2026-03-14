'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, CreditCard } from 'lucide-react';

const SETTINGS_NAV = [
  { label: 'アカウント設定', href: '/settings/account', icon: User },
  { label: '支払い設定', href: '/settings/billing', icon: CreditCard },
] as const;

type GlobalRole = 'guest' | 'learner' | 'instructor' | 'operator' | 'root_operator';

export function SettingsSidebar({ globalRole }: { globalRole: GlobalRole }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-iris-60 bg-iris-bg/50 px-4 py-6">
      <nav className="flex flex-col gap-0.5" aria-label="設定メニュー">
        {SETTINGS_NAV.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded px-3 py-2 text-sm tracking-[0.56px] ${
                isActive ? 'bg-iris-light text-black' : 'text-grey3'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
