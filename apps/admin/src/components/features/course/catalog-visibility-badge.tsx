'use client';

/**
 * CourseCatalogVisibility バッジ
 *
 * SoT: schema.prisma - CourseCatalogVisibility enum
 * 値: public_listed | public_unlisted | private
 */

import type { CourseCatalogVisibility } from '@/lib/admin-courses-api';

const VISIBILITY_CONFIG: Record<
  CourseCatalogVisibility,
  { label: string; className: string }
> = {
  public_listed: {
    label: '公開（掲載）',
    className: 'bg-success/10 text-success',
  },
  public_unlisted: {
    label: '公開（未掲載）',
    className: 'bg-warning/10 text-warning',
  },
  private: {
    label: '非公開',
    className: 'bg-textMuted/10 text-textMuted',
  },
};

type CatalogVisibilityBadgeProps = {
  visibility: CourseCatalogVisibility;
};

export function CatalogVisibilityBadge({
  visibility,
}: CatalogVisibilityBadgeProps) {
  const config =
    VISIBILITY_CONFIG[visibility] ?? VISIBILITY_CONFIG.public_listed;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
