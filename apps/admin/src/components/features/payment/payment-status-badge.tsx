'use client';

/**
 * PaymentStatus バッジ
 *
 * SoT: schema.prisma - PaymentStatus enum
 * 値: pending | succeeded | failed | canceled | refunded
 */

import type { PaymentStatus } from '@/lib/admin-payments-api';

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  pending: {
    label: '処理中',
    className: 'bg-warning/10 text-warning',
  },
  succeeded: {
    label: '成功',
    className: 'bg-success/10 text-success',
  },
  failed: {
    label: '失敗',
    className: 'bg-error/10 text-error',
  },
  canceled: {
    label: 'キャンセル',
    className: 'bg-textMuted/10 text-textMuted',
  },
  refunded: {
    label: '返金済',
    className: 'bg-accent/10 text-accent',
  },
};

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
