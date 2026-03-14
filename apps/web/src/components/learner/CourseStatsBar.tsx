'use client';

/**
 * 講座統計バー（STU-UI-03）
 */
import type { components } from '@adapt/types/openapi-app';

type CourseStatsView = components['schemas']['CourseStatsView'];

export interface CourseStatsBarProps {
  stats: CourseStatsView;
}

export function CourseStatsBar({ stats }: CourseStatsBarProps) {
  const items = [
    { label: '受講者数', value: stats.learnerCount },
    { label: '課題数', value: stats.assignmentCount },
    { label: 'レッスン数', value: stats.lessonCount },
    { label: 'アクティブチャンネル', value: stats.activeChannelCount },
  ];

  return (
    <div className="flex flex-wrap gap-4 rounded-lg border border-iris-60 bg-white px-4 py-3">
      {items.map(({ label, value }) => (
        <span key={label} className="text-sm text-black">
          <span className="text-grey3">{label}:</span> {value}
        </span>
      ))}
    </div>
  );
}
