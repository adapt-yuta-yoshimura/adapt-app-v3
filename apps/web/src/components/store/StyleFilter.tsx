'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { LayoutGrid, List } from 'lucide-react';

const STYLE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'すべて' },
  { value: 'one_on_one', label: '1on1' },
  { value: 'seminar', label: 'セミナー' },
  { value: 'bootcamp', label: 'ブートキャンプ' },
];

export function StyleFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const style = searchParams.get('style') ?? '';
  const view = searchParams.get('view') ?? 'grid';

  const setStyle = useCallback(
    (s: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (s) next.set('style', s);
      else next.delete('style');
      router.push(`/store?${next.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const setView = useCallback(
    (v: 'grid' | 'list') => {
      const next = new URLSearchParams(searchParams.toString());
      next.set('view', v);
      router.push(`/store?${next.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-iris-60 bg-white px-6 py-3">
      <div className="flex flex-wrap gap-2">
        {STYLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStyle(opt.value)}
            className={`
              rounded-full px-4 py-2 text-sm font-medium
              ${style === opt.value ? 'bg-iris-100 text-white' : 'bg-iris-light text-iris-100 hover:bg-iris-60 hover:text-white'}
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setView('grid')}
          className={`rounded p-2 ${view === 'grid' ? 'bg-iris-light text-iris-100' : 'text-grey3 hover:text-black'}`}
          aria-label="グリッド表示"
        >
          <LayoutGrid className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setView('list')}
          className={`rounded p-2 ${view === 'list' ? 'bg-iris-light text-iris-100' : 'text-grey3 hover:text-black'}`}
          aria-label="リスト表示"
        >
          <List className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
