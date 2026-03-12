'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Search } from 'lucide-react';

const HERO_COPY = 'プロのAIノウハウを今すぐに。';
const SEARCH_PLACEHOLDER = '学びたい内容はなんですか？';
const SUGGEST_TAGS = [
  'AI',
  'ChatGPT × Excel連携',
  'Cursor開発 × Claude',
  '営業資料 × Claude',
];

export function StoreHero() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  const updateQuery = useCallback(
    (q: string) => {
      setQuery(q);
      const next = new URLSearchParams(searchParams.toString());
      if (q) next.set('q', q);
      else next.delete('q');
      router.push(`/store?${next.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <section className="border-b border-iris-60 bg-iris-bg px-6 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-2xl font-bold tracking-tight text-black md:text-3xl">
          {HERO_COPY}
        </h1>
        <div className="relative mt-6">
          <div className="flex items-center rounded border border-iris-60 bg-white px-4 py-2">
            <Search className="h-5 w-5 shrink-0 text-grey3" aria-hidden />
            <input
              type="search"
              placeholder={SEARCH_PLACEHOLDER}
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && updateQuery(query)}
              className="ml-3 w-full bg-transparent text-black placeholder:text-grey3 focus:outline-none"
              aria-label={SEARCH_PLACEHOLDER}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {SUGGEST_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => updateQuery(tag)}
              className="rounded bg-iris-light px-3 py-1.5 text-sm text-iris-100 hover:bg-iris-60 hover:text-white"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
