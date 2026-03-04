'use client';

/**
 * CourseStyle バッジ
 *
 * SoT: schema.prisma - CourseStyle enum
 * 値: one_on_one | seminar | bootcamp | lecture
 */

import type { CourseStyle } from '@/lib/admin-courses-api';

const STYLE_CONFIG: Record<CourseStyle, { label: string; className: string }> = {
  one_on_one: {
    label: '1on1',
    className: 'bg-accent/10 text-accent',
  },
  seminar: {
    label: 'セミナー',
    className: 'bg-accent/10 text-accent',
  },
  bootcamp: {
    label: 'ブートキャンプ',
    className: 'bg-accent/10 text-accent',
  },
  lecture: {
    label: '講義',
    className: 'bg-accent/10 text-accent',
  },
};

type CourseStyleBadgeProps = {
  style: CourseStyle;
};

export function CourseStyleBadge({ style }: CourseStyleBadgeProps) {
  const config = STYLE_CONFIG[style] ?? STYLE_CONFIG.lecture;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
