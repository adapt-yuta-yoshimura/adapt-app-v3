'use client';

/**
 * 受講者向け講座カード（STU-UI-02, STU-UI-01）
 * クリックで /learner/courses/[courseId] へ遷移。
 */
import Link from 'next/link';
import { CourseStyleBadge } from '@/components/common/CourseStyleBadge';
import type { components } from '@adapt/types/openapi-app';

type CourseStyle = components['schemas']['CourseStyle'];

export interface LearnerCourseCardItem {
  id: string;
  title: string;
  style: CourseStyle;
  /** bootcamp の場合のみ表示（0–100） */
  progressPercent?: number;
}

export interface CourseCardProps {
  item: LearnerCourseCardItem;
}

export function CourseCard({ item }: CourseCardProps) {
  return (
    <Link
      href={`/learner/courses/${item.id}`}
      className="block overflow-hidden rounded-lg border border-iris-60 bg-white p-4 shadow-sm transition hover:border-iris-80 hover:shadow"
    >
      <h3 className="line-clamp-2 text-sm font-medium text-black">{item.title}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <CourseStyleBadge style={item.style} />
        {item.progressPercent !== undefined && item.style === 'bootcamp' && (
          <span className="text-xs text-grey3">進捗 {item.progressPercent}%</span>
        )}
      </div>
    </Link>
  );
}
