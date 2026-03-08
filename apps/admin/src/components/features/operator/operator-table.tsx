'use client';

import * as React from 'react';
import Link from 'next/link';
import { AdminTable } from '@/components/ui/admin-table';
import { RoleBadge } from './role-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import type { OperatorAdminView } from '@/lib/admin-operators-api';

export interface OperatorTableProps {
  data: OperatorAdminView[];
  sortKey: string;
  sortOrder: 'asc' | 'desc';
  onSort: (key: string) => void;
  page: number;
  totalPages: number;
  totalCount?: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

/**
 * 運営スタッフ一覧テーブル（ADMIN-03 / ADM-UI-07）
 *
 * カラム: 名前, メール, ロール（RoleBadge）, ステータス, 作成日
 */
export function OperatorTable({
  data,
  sortKey,
  sortOrder,
  onSort,
  page,
  totalPages,
  totalCount,
  onPageChange,
  isLoading,
}: OperatorTableProps) {
  const columns = React.useMemo(
    () => [
      {
        key: 'name',
        label: '名前',
        sortKey: 'name',
        render: (row: OperatorAdminView) => (
          <Link
            href={`/admin/operators/${row.id}`}
            className="text-accent hover:underline"
          >
            {row.name ?? '—'}
          </Link>
        ),
      },
      {
        key: 'email',
        label: 'メール',
        sortKey: 'email',
        render: (row: OperatorAdminView) => row.email ?? '—',
      },
      {
        key: 'globalRole',
        label: 'ロール',
        sortKey: 'globalRole',
        render: (row: OperatorAdminView) => (
          <RoleBadge role={row.globalRole} />
        ),
      },
      {
        key: 'status',
        label: 'ステータス',
        sortKey: 'status',
        render: (row: OperatorAdminView) => (
          <StatusBadge variant={row.isActive ? 'active' : 'deleted'}>
            {row.isActive ? 'アクティブ' : '削除済み'}
          </StatusBadge>
        ),
      },
      {
        key: 'createdAt',
        label: '作成日',
        sortKey: 'createdAt',
        render: (row: OperatorAdminView) =>
          row.createdAt
            ? new Date(row.createdAt).toLocaleString('ja-JP')
            : '—',
      },
    ],
    []
  );

  return (
    <AdminTable<OperatorAdminView>
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
