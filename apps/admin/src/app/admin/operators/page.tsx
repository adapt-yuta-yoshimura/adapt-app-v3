'use client';

import * as React from 'react';
import Link from 'next/link';
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
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">運営スタッフ</h1>
        <Link
          href="/admin/operators/new"
          className="rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90"
        >
          スタッフを招待
        </Link>
      </div>
      <FilterBar
        searchPlaceholder="名前・メールで検索"
        searchValue={search}
        onSearchChange={setSearch}
      />
      <OperatorTable
        data={sortedItems}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        page={data?.meta.page ?? 1}
        totalPages={data?.meta.totalPages ?? 1}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
