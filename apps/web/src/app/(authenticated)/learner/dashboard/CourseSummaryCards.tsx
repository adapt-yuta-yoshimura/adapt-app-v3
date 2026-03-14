'use client';

import { CourseCard } from '@/components/learner/CourseCard';
import type { LearnerCourseCardItem } from '@/components/learner/CourseCard';

export interface CourseSummaryCardsProps {
  items: LearnerCourseCardItem[];
}

export function CourseSummaryCards({ items }: CourseSummaryCardsProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-iris-60 bg-white p-6 text-sm text-grey3">
        受講中の講座はありません
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <CourseCard key={item.id} item={item} />
      ))}
    </div>
  );
}
