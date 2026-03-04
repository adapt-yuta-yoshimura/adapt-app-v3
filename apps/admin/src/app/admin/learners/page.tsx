'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchUserList, inviteUser } from '@/lib/admin-users-api';
import type { UserAdminView } from '@/lib/admin-users-api';
import { AdminTable } from '@/components/ui/admin-table';
import { FilterBar } from '@/components/ui/filter-bar';
import { StatusBadge } from '@/components/ui/status-badge';
import { UserInviteModal } from '@/components/features/user/user-invite-modal';

const STATUS_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: 'active', label: 'アクティブ' },
  { value: 'frozen', label: '凍結' },
  { value: 'deleted', label: '削除済み' },
];

export default function LearnersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [sortKey, setSortKey] = React.useState<string>('name');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  const isActiveParam =
    statusFilter === 'active' ? true : statusFilter === 'frozen' || statusFilter === 'deleted' ? false : undefined;
  const includeDeleted = statusFilter === 'deleted';

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', 'learner', { page, isActive: isActiveParam, includeDeleted }],
    queryFn: () =>
      fetchUserList({
        globalRole: 'learner',
        isActive: isActiveParam,
        includeDeleted: includeDeleted || undefined,
        page,
        perPage: 20,
      }),
  });

  const filteredItems = React.useMemo(() => {
    const items = data?.items ?? [];
    if (!search.trim()) return items;
    const s = search.toLowerCase();
    return items.filter(
      (row) =>
        row.user.name?.toLowerCase().includes(s) ||
        row.user.email?.toLowerCase().includes(s)
    );
  }, [data?.items, search]);

  const sortedItems = React.useMemo(() => {
    const items = [...filteredItems];
    const order = sortOrder === 'asc' ? 1 : -1;
    items.sort((a, b) => {
      if (sortKey === 'name') {
        const va = a.user.name ?? '';
        const vb = b.user.name ?? '';
        return order * va.localeCompare(vb);
      }
      if (sortKey === 'email') {
        const va = a.user.email ?? '';
        const vb = b.user.email ?? '';
        return order * va.localeCompare(vb);
      }
      if (sortKey === 'status') {
        const va = a.status;
        const vb = b.status;
        return order * va.localeCompare(vb);
      }
      if (sortKey === 'lastLoginAt') {
        const va = a.lastLoginAt ?? '';
        const vb = b.lastLoginAt ?? '';
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

  const handleInviteSubmit = async (body: { email: string; name: string; globalRole: 'learner' | 'instructor' }) => {
    await inviteUser(body);
    await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
  };

  const columns = React.useMemo(
    () => [
      {
        key: 'name',
        label: '名前',
        sortKey: 'name',
        render: (row: UserAdminView) => (
          <Link
            href={`/admin/learners/${row.user.id}`}
            className="text-accent hover:underline"
            onClick={() => {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('admin_selected_learner', JSON.stringify(row));
              }
            }}
          >
            {row.user.name ?? '—'}
          </Link>
        ),
      },
      {
        key: 'email',
        label: 'メール',
        sortKey: 'email',
        render: (row: UserAdminView) => row.user.email ?? '—',
      },
      {
        key: 'status',
        label: 'ステータス',
        sortKey: 'status',
        render: (row: UserAdminView) => (
          <StatusBadge variant={row.status}>{row.status === 'active' ? 'アクティブ' : row.status === 'frozen' ? '凍結' : '削除済み'}</StatusBadge>
        ),
      },
      {
        key: 'lastLoginAt',
        label: '最終ログイン',
        sortKey: 'lastLoginAt',
        render: (row: UserAdminView) =>
          row.lastLoginAt
            ? new Date(row.lastLoginAt).toLocaleString('ja-JP')
            : '—',
      },
    ],
    []
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">受講者管理</h1>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90"
        >
          受講者を招待
        </button>
      </div>
      <FilterBar
        searchPlaceholder="名前・メールで検索"
        searchValue={search}
        onSearchChange={setSearch}
        filterLabel="ステータス"
        filterOptions={STATUS_OPTIONS}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
      />
      <AdminTable<UserAdminView>
        columns={columns}
        data={sortedItems}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        page={data?.meta.page ?? 1}
        totalPages={data?.meta.totalPages ?? 1}
        onPageChange={setPage}
        isLoading={isLoading}
      />
      <UserInviteModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        globalRole="learner"
        onSubmit={handleInviteSubmit}
      />
    </div>
  );
}
