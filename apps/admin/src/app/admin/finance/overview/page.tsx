'use client';

/**
 * ADM-UI-14: 売上・決済管理
 *
 * - Path: /admin/finance/overview
 * - Figma: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8357-3&m=dev
 * - ロール: operator, root_operator
 * - API: API-ADMIN-19
 *
 * ADMIN-05チケット参照
 */

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPaymentList } from '@/lib/admin-payments-api';
import { FilterBar } from '@/components/ui/filter-bar';
import { PaymentTable } from '@/components/features/payment/payment-table';

export default function FinanceOverviewPage() {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState('createdAt');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  const { data, isLoading } = useQuery({
    queryKey: [
      'admin',
      'payments',
      { page, status: statusFilter, sortKey, sortOrder },
    ],
    queryFn: () =>
      fetchPaymentList({
        page,
        perPage: 20,
        status: statusFilter || undefined,
        sortBy: sortKey,
        sortOrder,
      }),
  });

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-text">
          売上・決済
        </h1>
        <p className="mt-1 text-sm tracking-wide text-textTertiary">
          決済一覧・集計（API-ADMIN-19）
        </p>
      </div>

      {/* TODO(TBD): Cursor実装 - KPIカード4枚 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-textTertiary">総売上</p>
          <p className="mt-2 text-2xl font-bold text-text">
            {/* TODO(TBD): Cursor実装 - 集計値 */}
            -
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-textTertiary">月間売上</p>
          <p className="mt-2 text-2xl font-bold text-text">-</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-textTertiary">決済件数</p>
          <p className="mt-2 text-2xl font-bold text-text">
            {data?.meta.totalCount ?? '-'}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-textTertiary">返金件数</p>
          <p className="mt-2 text-2xl font-bold text-text">
            {/* TODO(TBD): Cursor実装 - 返金件数集計 */}
            -
          </p>
        </div>
      </div>

      <div className="rounded-[10px] border border-border bg-card px-4 py-3 [&>div]:mb-0">
        <FilterBar
        searchPlaceholder="ユーザー名・講座名で検索..."
        searchValue={search}
        onSearchChange={setSearch}
        filterLabel="ステータス"
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { value: '', label: 'すべて' },
          { value: 'pending', label: '処理中' },
          { value: 'succeeded', label: '成功' },
          { value: 'failed', label: '失敗' },
          { value: 'canceled', label: 'キャンセル' },
          { value: 'refunded', label: '返金済' },
        ]}
      />
      </div>

      <PaymentTable
        data={data?.items ?? []}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        page={page}
        totalPages={data?.meta.totalPages ?? 1}
        totalCount={data?.meta.totalCount ?? 0}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
