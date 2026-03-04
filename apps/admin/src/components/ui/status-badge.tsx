'use client';

/**
 * StatusBadge（ADMIN-00 共通コンポーネント）
 * SoT Enum値に対応した色分けバッジ
 * 他チケットで GlobalRole / CourseStatus / PaymentStatus 等のマッピングを追加
 */
const VARIANT_STYLES: Record<string, string> = {
  root_operator: 'bg-accent/10 text-accent',
  operator: 'bg-accent/10 text-accent',
  learner: 'bg-success/10 text-success',
  instructor: 'bg-accent/10 text-accent',
  guest: 'bg-border text-textTertiary',
  active: 'bg-success/10 text-success',
  draft: 'bg-textMuted/10 text-textMuted',
  pending_approval: 'bg-warning/10 text-warning',
  archived: 'bg-error/10 text-error',
  frozen: 'bg-error/10 text-error',
  deleted: 'bg-textMuted/10 text-textMuted',
  inactive: 'bg-textMuted/10 text-textMuted',
  default: 'bg-border text-textSecondary',
};

export interface StatusBadgeProps {
  variant: string;
  children: React.ReactNode;
}

export function StatusBadge({ variant, children }: StatusBadgeProps) {
  const style = VARIANT_STYLES[variant] ?? VARIANT_STYLES.default;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {children}
    </span>
  );
}
