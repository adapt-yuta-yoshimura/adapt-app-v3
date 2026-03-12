'use client';

import Link from 'next/link';
import { useUser } from '@/lib/user-context';
import { canAccessInstructorMode } from '@/lib/auth';

type Mode = 'instructor' | 'learner';

/**
 * 受講者/講師モード切替トグル
 * learner ロールのみのユーザーには表示しない
 */
export function ModeSwitcher({ currentMode }: { currentMode: Mode }) {
  const { user } = useUser();
  const showSwitcher = user && canAccessInstructorMode(user.globalRole);
  if (!showSwitcher) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-bold text-black">モード切り替え</span>
      <div className="flex overflow-hidden rounded border border-iris-100">
        <Link
          href="/learner/dashboard"
          className={`flex-1 px-3 py-2 text-center text-sm ${
            currentMode === 'learner' ? 'bg-iris-100 text-white' : 'bg-white text-iris-80'
          }`}
        >
          受講者
        </Link>
        <Link
          href="/instructor/dashboard"
          className={`flex-1 px-3 py-2 text-center text-sm ${
            currentMode === 'instructor' ? 'bg-iris-100 text-white' : 'bg-white text-iris-80'
          }`}
        >
          講師
        </Link>
      </div>
    </div>
  );
}
