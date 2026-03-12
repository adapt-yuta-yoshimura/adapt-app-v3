'use client';

import Link from 'next/link';
import { useUser } from '@/lib/user-context';

export function ApplyButton({ courseId }: { courseId: string }) {
  const { user, isLoading } = useUser();
  const applyPath = `/learner/courses/${courseId}/apply`;

  if (isLoading) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded bg-iris-60 py-3 text-sm font-medium text-white"
      >
        読み込み中…
      </button>
    );
  }

  if (!user) {
    return (
      <Link
        href={`/login?from=${encodeURIComponent(applyPath)}`}
        className="block w-full rounded bg-iris-100 py-3 text-center text-sm font-medium text-white hover:bg-iris-80"
      >
        この講座に参加する（ログインへ）
      </Link>
    );
  }

  return (
    <Link
      href={applyPath}
      className="block w-full rounded bg-iris-100 py-3 text-center text-sm font-medium text-white hover:bg-iris-80"
    >
      この講座に参加する
    </Link>
  );
}
