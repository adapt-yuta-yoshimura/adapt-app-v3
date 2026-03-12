'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const CATEGORIES = [
  'すべて',
  'AI',
  'プロダクト開発',
  'デザイン',
  'マーケティング',
  'エンジニア',
  'ChatGPT × Excel連携',
  'Cursor開発 × Claude',
  '営業資料 × Claude',
] as const;

export function CategoryTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('category') ?? 'すべて';

  const setCategory = useCallback(
    (category: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (category === 'すべて') next.delete('category');
      else next.set('category', category);
      router.push(`/store?${next.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <nav aria-label="カテゴリ" className="border-b border-iris-60 bg-white">
      <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-6 py-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`
              shrink-0 border-b-2 pb-1 text-sm font-medium transition
              ${current === cat ? 'border-iris-100 text-iris-100' : 'border-transparent text-grey3 hover:text-black'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>
    </nav>
  );
}
