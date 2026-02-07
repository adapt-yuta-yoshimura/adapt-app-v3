'use client';

import Link from 'next/link';
import { Button, Avatar, AvatarFallback } from '@adapt/ui';

import { useAuthStore } from '@/stores/auth.store';

export function Header(): React.ReactNode {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <header className="flex h-16 items-center border-b bg-card px-6">
      <Link href="/" className="text-xl font-bold text-primary md:hidden">
        adapt
      </Link>
      <div className="ml-auto flex items-center gap-4">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.displayName}
            </span>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {user.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">ログイン</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">新規登録</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
