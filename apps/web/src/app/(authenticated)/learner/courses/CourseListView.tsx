'use client';

import { CourseCard } from '@/components/learner/CourseCard';
import type { LearnerCourseCardItem } from '@/components/learner/CourseCard';

export interface CourseListViewProps {
  items: LearnerCourseCardItem[];
  meta?: {
    page?: { page: number; pageSize: number; total?: number | null };
    cursor?: { nextCursor?: string | null; hasMore: boolean };
  };
}

export function CourseListView({ items, meta }: CourseListViewProps) {
  const total = meta?.page?.total ?? items.length;

  return (
    <section className="mt-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <CourseCard key={item.id} item={item} />
        ))}
      </div>
      {meta?.page && total > 0 && (
        <p className="mt-4 text-xs text-grey3">
          全 {total} 件
        </p>
      )}
      {items.length === 0 && (
        <p className="rounded-lg border border-iris-60 bg-white p-6 text-sm text-grey3">
          受講中の講座はありません
        </p>
      )}
    </section>
  );
}
