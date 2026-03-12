'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { CourseSummaryView } from '@/lib/store-api-types';
import { CourseCard } from './CourseCard';
import { getApiBaseUrl } from '@/lib/api-base-url';

async function fetchStoreCoursesPage(params: {
  style?: string;
  category?: string;
  page: number;
}): Promise<{ items: CourseSummaryView[]; hasMore: boolean }> {
  const sp = new URLSearchParams();
  if (params.style) sp.set('style', params.style);
  if (params.category) sp.set('category', params.category);
  sp.set('page', String(params.page));
  const base = getApiBaseUrl();
  const url = `${base}/api/v1/store/courses?${sp.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  const data = await res.json();
  const meta = data.meta as { page?: { total?: number; pageSize?: number; page?: number } } | undefined;
  const pageSize = meta?.page?.pageSize ?? 20;
  const total = meta?.page?.total ?? 0;
  const hasMore = data.items.length >= pageSize && (total === 0 || (meta?.page?.page ?? 1) * pageSize < total);
  return { items: data.items, hasMore };
}

export interface CourseCardGridProps {
  initialItems: CourseSummaryView[];
  style?: string | null;
  category?: string | null;
  initialHasMore?: boolean;
}

function getPriceYen(item: CourseSummaryView): number {
  const c = item as unknown as { course?: { priceYen?: number }; priceYen?: number };
  return c?.course?.priceYen ?? c?.priceYen ?? 0;
}

export function CourseCardGrid({
  initialItems,
  style,
  category,
  initialHasMore = true,
}: CourseCardGridProps) {
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<CourseSummaryView[]>(initialItems);

  const { data, isFetching } = useQuery({
    queryKey: ['store', 'courses', style, category, page],
    queryFn: () =>
      fetchStoreCoursesPage({
        style: style ?? undefined,
        category: category === 'すべて' ? undefined : category ?? undefined,
        page,
      }),
    enabled: page > 1,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (page > 1 && data?.items.length) {
      setAccumulated((prev) => (page === 2 ? [...initialItems, ...data.items] : [...prev, ...data.items]));
    }
  }, [page, data, initialItems]);

  const hasMore = page === 1 ? initialHasMore : data?.hasMore ?? false;
  const showLoadMore = hasMore && !isFetching;

  const loadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const items = accumulated;

  return (
    <div className="px-6 py-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <CourseCard
            key={item.course.id}
            course={item.course}
            channelCount={item.channelCount}
            memberCount={item.memberCount}
            priceYen={getPriceYen(item)}
            ownerDisplayName={(item as unknown as { ownerDisplayName?: string }).ownerDisplayName}
            ownerAvatarUrl={(item as unknown as { ownerAvatarUrl?: string | null }).ownerAvatarUrl}
            thumbnailUrl={(item.course as unknown as { thumbnailUrl?: string | null }).thumbnailUrl}
          />
        ))}
      </div>
      {showLoadMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            className="rounded bg-iris-100 px-8 py-3 text-sm font-medium text-white hover:bg-iris-80"
            disabled={isFetching}
          >
            {isFetching ? '読み込み中…' : 'さらに表示'}
          </button>
        </div>
      )}
    </div>
  );
}
