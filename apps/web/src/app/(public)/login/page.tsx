// PG-002 ログイン（認証スタブ: Cookie セット後にリダイレクト）
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, Suspense } from 'react';

const AUTH_COOKIE = 'adapt_token';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/instructor/dashboard';

  const handleStubLogin = useCallback(() => {
    const token =
      typeof window !== 'undefined'
        ? process.env.NEXT_PUBLIC_STUB_TOKEN ?? 'stub-instructor-token'
        : '';
    document.cookie = `${AUTH_COOKIE}=${token}; path=/; max-age=86400`;
    router.push(from);
    router.refresh();
  }, [router, from]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">ログイン</h1>
      <p className="mt-2 text-gray-500">PG-002 — 実装予定</p>
      <p className="mt-2 text-sm text-grey3">
        認証スタブ: 下のボタンで Cookie をセットし講師ダッシュボードへ移動します。
      </p>
      <button
        type="button"
        onClick={handleStubLogin}
        className="mt-4 rounded bg-iris-100 px-4 py-2 text-sm text-white"
      >
        スタブでログイン（講師）
      </button>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-grey3">読み込み中…</div>}>
      <LoginContent />
    </Suspense>
  );
}
