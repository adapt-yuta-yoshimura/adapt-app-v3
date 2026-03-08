'use client';

/**
 * StatusBadge（ADMIN-00 共通コンポーネント）
 * SoT Enum値に対応した色分けバッジ（Figma: Active/Frozen はドット付き）
 */
const VARIANT_STYLES: Record<string, { bg: string; text: string; dot?: string }> = {
  root_operator: { bg: 'bg-[#dbeafe]', text: 'text-[#1d4ed8]' },
  operator: { bg: 'bg-[#f1f5f9]', text: 'text-[#475569]' },
  learner: { bg: 'bg-success/10', text: 'text-success' },
  instructor: { bg: 'bg-accent/10', text: 'text-accent' },
  guest: { bg: 'bg-border', text: 'text-textTertiary' },
  active: { bg: 'bg-[#f0fdf4]', text: 'text-[#16a34a]', dot: 'bg-[#16a34a]' },
  draft: { bg: 'bg-textMuted/10', text: 'text-textMuted' },
  pending_approval: { bg: 'bg-warning/10', text: 'text-warning' },
  archived: { bg: 'bg-error/10', text: 'text-error' },
  frozen: { bg: 'bg-[#fef2f2]', text: 'text-[#dc2626]', dot: 'bg-[#dc2626]' },
  deleted: { bg: 'bg-textMuted/10', text: 'text-textMuted' },
  inactive: { bg: 'bg-textMuted/10', text: 'text-textMuted' },
  default: { bg: 'bg-border', text: 'text-textSecondary' },
};

export interface StatusBadgeProps {
  variant: string;
  children: React.ReactNode;
}

export function StatusBadge({ variant, children }: StatusBadgeProps) {
  const style = VARIANT_STYLES[variant] ?? VARIANT_STYLES.default;
  const showDot = style.dot != null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
    >
      {showDot && (
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
