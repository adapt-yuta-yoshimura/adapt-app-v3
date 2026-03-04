'use client';

/**
 * CourseStatus バッジ
 *
 * SoT: schema.prisma - CourseStatus enum
 * 値: draft | pending_approval | active | archived
 */

import type { CourseStatus } from '@/lib/admin-courses-api';

const STATUS_CONFIG: Record<
  CourseStatus,
  { label: string; className: string }
> = {
  draft: {
    label: '下書き',
    className: 'bg-border text-textSecondary',
  },
  pending_approval: {
    label: '承認待ち',
    className: 'bg-warning/10 text-warning',
  },
  active: {
    label: '運用中',
    className: 'bg-success/10 text-success',
  },
  archived: {
    label: 'アーカイブ',
    className: 'bg-textMuted/10 text-textMuted',
  },
};

type CourseStatusBadgeProps = {
  status: CourseStatus;
};

export function CourseStatusBadge({ status }: CourseStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
