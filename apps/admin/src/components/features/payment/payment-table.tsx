'use client';

/**
 * 決済一覧テーブル
 *
 * ADM-UI-14 で使用
 * Figma: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8357-3&m=dev
 *
 * SoT: openapi_admin.yaml - PaymentSummaryView
 */

import type { PaymentSummaryView } from '@/lib/admin-payments-api';
import { AdminTable } from '@/components/ui/admin-table';
import type { AdminTableColumn } from '@/components/ui/admin-table';
import { PaymentStatusBadge } from './payment-status-badge';

type ProviderBadgeProps = {
  provider: 'stripe' | 'manual';
};

function ProviderBadge({ provider }: ProviderBadgeProps) {
  const config =
    provider === 'stripe'
      ? { label: 'Stripe', className: 'bg-purple-100 text-purple-700' }
      : { label: '手動', className: 'bg-textMuted/10 text-textMuted' };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

type PaymentTableProps = {
  data: PaymentSummaryView[];
  sortKey: string;
  sortOrder: 'asc' | 'desc';
  onSort: (key: string) => void;
  page: number;
  totalPages: number;
  totalCount?: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
};

export function PaymentTable({
  data,
  sortKey,
  sortOrder,
  onSort,
  page,
  totalPages,
  totalCount,
  onPageChange,
  isLoading,
}: PaymentTableProps) {
  const columns: AdminTableColumn<PaymentSummaryView>[] = [
    {
      key: 'userName',
      label: 'ユーザー',
      sortKey: 'userName',
      render: (row) => (
        <span className="text-sm text-text">{row.userName}</span>
      ),
    },
    {
      key: 'courseTitle',
      label: '講座',
      sortKey: 'courseTitle',
      render: (row) => (
        <span className="text-sm text-text">
          {row.courseTitle ?? '-'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: '金額',
      sortKey: 'amount',
      render: (row) => (
        <span className="text-sm text-text">
          {row.amount.toLocaleString()} {row.currency.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'ステータス',
      sortKey: 'status',
      render: (row) => <PaymentStatusBadge status={row.status} />,
    },
    {
      key: 'provider',
      label: 'プロバイダー',
      sortKey: 'provider',
      render: (row) => <ProviderBadge provider={row.provider} />,
    },
    {
      key: 'paidAt',
      label: '決済日',
      sortKey: 'paidAt',
      render: (row) =>
        row.paidAt
          ? new Date(row.paidAt).toLocaleDateString('ja-JP')
          : '-',
    },
    {
      key: 'createdAt',
      label: '作成日',
      sortKey: 'createdAt',
      render: (row) =>
        new Date(row.createdAt).toLocaleDateString('ja-JP'),
    },
  ];

  return (
    <AdminTable<PaymentSummaryView>
      columns={columns}
      data={data}
      sortKey={sortKey}
      sortOrder={sortOrder}
      onSort={onSort}
      page={page}
      totalPages={totalPages}
      totalCount={totalCount}
      onPageChange={onPageChange}
      isLoading={isLoading}
    />
  );
}
