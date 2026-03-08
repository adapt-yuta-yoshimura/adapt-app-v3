'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchOperatorList } from '@/lib/admin-operators-api';
import type { OperatorAdminView } from '@/lib/admin-operators-api';
import { OperatorTable } from '@/components/features/operator/operator-table';
import { FilterBar } from '@/components/ui/filter-bar';

/**
 * ADM-UI-07: 運営スタッフ一覧
 *
 * - Path: /admin/operators
 * - API: API-ADMIN-15 GET /api/v1/admin/operators
 * - ロール: root_operator のみ（operator は 403 / サイドバー非表示）
 */
export default function OperatorsPage() {
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<string>('name');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'operators', { page, perPage: 20 }],
    queryFn: () => fetchOperatorList({ page, perPage: 20 }),
  });

  const filteredItems = React.useMemo(() => {
    const items = data?.items ?? [];
    if (!search.trim()) return items;
    const s = search.toLowerCase();
    return items.filter(
      (row) =>
        row.name?.toLowerCase().includes(s) ||
        row.email?.toLowerCase().includes(s)
    );
  }, [data?.items, search]);

  const sortedItems = React.useMemo(() => {
    const items = [...filteredItems];
    const order = sortOrder === 'asc' ? 1 : -1;
    items.sort((a, b) => {
      if (sortKey === 'name') {
        const va = a.name ?? '';
        const vb = b.name ?? '';
        return order * va.localeCompare(vb);
      }
      if (sortKey === 'email') {
        const va = a.email ?? '';
        const vb = b.email ?? '';
        return order * va.localeCompare(vb);
      }
      if (sortKey === 'globalRole') {
        const va = a.globalRole;
        const vb = b.globalRole;
        return order * va.localeCompare(vb);
      }
      if (sortKey === 'status') {
        const va = a.isActive ? 'active' : 'deleted';
        const vb = b.isActive ? 'active' : 'deleted';
        return order * va.localeCompare(vb);
      }
      if (sortKey === 'createdAt') {
        const va = a.createdAt ?? '';
        const vb = b.createdAt ?? '';
        return order * va.localeCompare(vb);
      }
      return 0;
    });
    return items;
  }, [filteredItems, sortKey, sortOrder]);

  const handleSort = (key: string) => {
    setSortKey(key);
    setSortOrder((prev) => (prev === 'asc' && sortKey === key ? 'desc' : 'asc'));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            運営スタッフ管理
          </h1>
          <p className="mt-1 text-sm tracking-wide text-textTertiary">
            {data?.meta?.totalCount != null
              ? `${data.meta.totalCount}名のスタッフが登録されています`
              : '運営スタッフの一覧です'}
          </p>
        </div>
        <Link
          href="/admin/operators/new"
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent py-2.5 px-5 text-sm font-semibold tracking-wide text-white shadow-[0_2px_8px_rgba(59,130,246,0.25)] transition-all duration-200 hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" />
          運営スタッフ追加
        </Link>
      </div>
      <div className="rounded-[10px] border border-border bg-card px-4 py-3 [&>div]:mb-0">
        <FilterBar
          searchPlaceholder="名前、メールで検索…"
          searchValue={search}
          onSearchChange={setSearch}
        />
      </div>
      <OperatorTable
        data={sortedItems}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        page={data?.meta.page ?? 1}
        totalPages={data?.meta.totalPages ?? 1}
        totalCount={data?.meta?.totalCount ?? 0}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
