'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useUser } from '@/lib/user-context';
import { canAccessInstructorMode } from '@/lib/auth';

const LOGO_TEXT = 'adapt';

export function WebHeader() {
  const { user, isLoading } = useUser();
  const isLoggedIn = !!user;

  return (
    <header className="flex h-[70px] w-full items-center justify-between border-b border-iris-60 bg-iris-bg px-6">
      <Link href="/" className="flex items-center text-xl font-bold tracking-wide text-black">
        {LOGO_TEXT}
      </Link>

      <nav className="flex items-center gap-6" aria-label="メインナビゲーション">
        {isLoading ? (
          <span className="text-sm text-grey3">読み込み中…</span>
        ) : isLoggedIn ? (
          <>
            <Link
              href="/learner/dashboard"
              className="text-sm tracking-[0.56px] text-black hover:underline"
            >
              マイページ
            </Link>
            <Link
              href="/store"
              className="text-sm tracking-[0.56px] text-black hover:underline"
            >
              講座を探す
            </Link>
            {canAccessInstructorMode(user.globalRole) && (
              <Link
                href="/instructor/courses/new"
                className="text-sm tracking-[0.56px] text-black hover:underline"
              >
                講座を作る
              </Link>
            )}
            <button
              type="button"
              className="relative flex h-5 w-5 items-center justify-center text-black"
              aria-label="通知"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-[10px] min-w-[10px] items-center justify-center rounded-full bg-fuschia-100 px-1 text-[10px] font-bold leading-none text-white">
                1
              </span>
            </button>
            <Link
              href="/settings"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-iris-light text-sm font-medium text-black"
              aria-label="ユーザーメニュー"
            >
              {(user.name ?? user.email ?? 'U').charAt(0).toUpperCase()}
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/instructor/courses/new"
              className="text-sm tracking-[0.56px] text-black hover:underline"
            >
              講座を作る
            </Link>
            <Link
              href="/signup"
              className="text-sm tracking-[0.56px] text-black hover:underline"
            >
              新規登録
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center rounded px-4 py-2 text-sm font-normal text-white bg-iris-100 tracking-[0.56px]"
            >
              ログイン
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
