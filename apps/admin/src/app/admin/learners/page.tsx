'use client';

import * as React from 'react';
import Link from 'next/link';
import { UserPlus, Eye, Snowflake, Sun, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchUserList,
  inviteUser,
} from '@/lib/admin-users-api';
import type { UserAdminView } from '@/lib/admin-users-api';
import { AdminTable, type AdminTableColumn } from '@/components/ui/admin-table';
import { FilterBar } from '@/components/ui/filter-bar';
import { StatusBadge } from '@/components/ui/status-badge';
import { UserInviteModal } from '@/components/features/user/user-invite-modal';
import { UserFreezeModal } from '@/components/features/user/user-freeze-modal';
import { UserUnfreezeModal } from '@/components/features/user/user-unfreeze-modal';
import { UserDeleteModal } from '@/components/features/user/user-delete-modal';

/** JSX準拠: すべて / Active / Frozen（ラベル表記） */
const STATUS_TABS = [
  { value: '', label: 'すべて' },
  { value: 'active', label: 'Active' },
  { value: 'frozen', label: 'Frozen' },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

export default function LearnersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [sortKey, setSortKey] = React.useState<string>('name');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [targetUser, setTargetUser] = React.useState<UserAdminView | null>(null);
  const [modalType, setModalType] = React.useState<'freeze' | 'unfreeze' | 'delete' | null>(null);

  const isActiveParam =
    statusFilter === 'active' ? true : statusFilter === 'frozen' ? false : undefined;
  const includeDeleted = false;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', 'learner', { page, perPage, isActive: isActiveParam, includeDeleted }],
    queryFn: () =>
      fetchUserList({
        globalRole: 'learner',
        isActive: isActiveParam,
        includeDeleted: includeDeleted || undefined,
        page,
        perPage,
      }),
  });

  const { data: countAll } = useQuery({
    queryKey: ['admin', 'users', 'learner', 'count'],
    queryFn: () => fetchUserList({ globalRole: 'learner', page: 1, perPage: 1 }),
  });
  const { data: countActive } = useQuery({
    queryKey: ['admin', 'users', 'learner', 'count', 'active'],
    queryFn: () =>
      fetchUserList({ globalRole: 'learner', isActive: true, page: 1, perPage: 1 }),
  });
  const { data: countFrozen } = useQuery({
    queryKey: ['admin', 'users', 'learner', 'count', 'frozen'],
    queryFn: () =>
      fetchUserList({
        globalRole: 'learner',
        isActive: false,
        includeDeleted: false,
        page: 1,
        perPage: 1,
      }),
  });

  const totalCount = countAll?.meta?.totalCount ?? 0;
  const activeCount = countActive?.meta?.totalCount ?? 0;
  const frozenCount = countFrozen?.meta?.totalCount ?? 0;

  const filteredItems = React.useMemo(() => {
    const items = data?.items ?? [];
    if (!search.trim()) return items;
    const s = search.toLowerCase();
    return items.filter(
      (row) =>
        row.user.name?.toLowerCase().includes(s) ||
        (row.user.email?.toLowerCase().includes(s) ?? false)
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
        return order * (a.status.localeCompare(b.status));
      }
      if (sortKey === 'createdAt') {
        const va = a.user.createdAt ?? '';
        const vb = b.user.createdAt ?? '';
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

  const handleInviteSubmit = async (body: {
    email: string;
    name: string;
    globalRole: 'learner' | 'instructor';
  }) => {
    await inviteUser(body);
    await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
  };

  const closeModal = () => {
    setTargetUser(null);
    setModalType(null);
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    setTargetUser(null);
    setModalType(null);
  };

  const columns = React.useMemo(
    (): AdminTableColumn<UserAdminView>[] => [
      {
        key: 'name',
        label: '受講者名',
        sortKey: 'name',
        render: (row) => (
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-[13px] font-bold text-success">
              {(row.user.name ?? row.user.id).charAt(0)}
            </div>
            <div>
              <div className="text-[13px] font-semibold text-text">
                {row.user.name ?? '—'}
              </div>
              <div className="text-[11px] text-textTertiary">{row.user.id}</div>
            </div>
          </div>
        ),
      },
      {
        key: 'email',
        label: 'メールアドレス',
        sortKey: 'email',
        render: (row) => (
          <span className="text-[13px] text-textSecondary">
            {row.user.email ?? '—'}
          </span>
        ),
      },
      {
        key: 'courseCount',
        label: '受講講座数',
        render: () => (
          <span className="text-[13px] font-semibold text-textSecondary">—</span>
        ),
      },
      {
        key: 'status',
        label: 'ステータス',
        sortKey: 'status',
        render: (row) => (
          <StatusBadge variant={row.status}>
            {row.status === 'active' ? 'Active' : row.status === 'frozen' ? 'Frozen' : 'Frozen'}
          </StatusBadge>
        ),
      },
      {
        key: 'createdAt',
        label: '登録日',
        sortKey: 'createdAt',
        render: (row) => (
          <span className="text-[13px] text-textTertiary">
            {row.user.createdAt ? formatDate(row.user.createdAt) : '—'}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'アクション',
        render: (row) => (
          <div className="flex gap-1">
            <Link
              href={`/admin/learners/${row.user.id}`}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('admin_selected_learner', JSON.stringify(row));
                }
              }}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-textSecondary hover:bg-bg"
            >
              <Eye className="h-4 w-4" /> 詳細
            </Link>
            {row.status === 'active' ? (
              <button
                type="button"
                onClick={() => { setTargetUser(row); setModalType('freeze'); }}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-warning hover:bg-bg"
              >
                <Snowflake className="h-4 w-4" /> 凍結
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setTargetUser(row); setModalType('unfreeze'); }}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-accent hover:bg-bg"
              >
                <Sun className="h-4 w-4" /> 解除
              </button>
            )}
            <button
              type="button"
              onClick={() => { setTargetUser(row); setModalType('delete'); }}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-error hover:bg-bg"
            >
              <Trash2 className="h-4 w-4" /> 削除
            </button>
          </div>
        ),
      },
    ],
    [sortKey]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-text">
            受講者管理
          </h1>
          <p className="mt-1 text-[13px] text-textTertiary">
            プラットフォーム上の受講者アカウントを管理します
          </p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-[13px] text-textTertiary">
            全 <strong className="text-text">{totalCount}</strong> 名 | Active{' '}
            <strong className="text-success">{activeCount}</strong> Frozen{' '}
            <strong className="text-error">{frozenCount}</strong>
          </p>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent py-2 px-[18px] text-[13px] font-semibold text-white shadow-[0_1px_3px_rgba(59,130,246,0.3)] transition-colors hover:bg-accent/90"
          >
            <UserPlus className="h-4 w-4" />
            受講者を招待
          </button>
        </div>
      </div>

      {/* 1カード内: ツールバー + テーブル + ページネーション（JSX準拠） */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <FilterBar
            variant="tabs"
            searchPlaceholder="名前・メールアドレスで検索..."
            searchValue={search}
            onSearchChange={setSearch}
            filterOptions={STATUS_TABS}
            filterValue={statusFilter}
            onFilterChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          />
        </div>
        <AdminTable<UserAdminView>
          columns={columns}
          data={sortedItems}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={handleSort}
          page={data?.meta.page ?? 1}
          totalPages={data?.meta.totalPages ?? 1}
          totalCount={data?.meta.totalCount ?? sortedItems.length}
          perPage={perPage}
          perPageOptions={[5, 10, 50, 100]}
          onPageChange={setPage}
          onPerPageChange={(n) => {
            setPerPage(n);
            setPage(1);
          }}
          isLoading={isLoading}
        />
      </div>

      <UserInviteModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        globalRole="learner"
        onSubmit={handleInviteSubmit}
      />

      {modalType === 'freeze' && (
        <UserFreezeModal
          open
          onClose={closeModal}
          user={targetUser?.user ?? null}
          onSuccess={handleModalSuccess}
        />
      )}
      {modalType === 'unfreeze' && (
        <UserUnfreezeModal
          open
          onClose={closeModal}
          user={targetUser?.user ?? null}
          onSuccess={handleModalSuccess}
        />
      )}
      {modalType === 'delete' && (
        <UserDeleteModal
          open
          onClose={closeModal}
          user={targetUser?.user ?? null}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
