'use client';

import { useMemo, useState, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Users, UserCheck, UserX } from 'lucide-react';
import type { AdminApi } from '@adapt/types';

import {
  Badge,
  Button,
  DataTable,
  FreezeModal,
  Input,
  StatCard,
} from '@/components/ui';
import { useAdminTitle } from '@/contexts/admin-title-context';
import { useAdminUsers } from '@/hooks/use-admin-users';

type UserAdminView = AdminApi.components['schemas']['UserAdminView'];

function getInitial(name: string | null | undefined, email: string | null | undefined): string {
  if (name?.trim()) return name.trim().slice(0, 1).toUpperCase();
  if (email?.trim()) return email.trim().slice(0, 1).toUpperCase();
  return '?';
}

/**
 * ユーザー管理一覧（§2-C / API-074）
 * 統計カード、検索、DataTable、凍結/解除 → FreezeModal
 */
export default function AdminUsersPage(): React.ReactNode {
  const setTitle = useAdminTitle();
  useEffect(() => {
    setTitle('ユーザー管理');
  }, [setTitle]);

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [freezeModal, setFreezeModal] = useState<{
    mode: 'freeze' | 'unfreeze';
    userId: string;
  } | null>(null);

  const { data, isLoading } = useAdminUsers(page, 20, q || undefined);
  const items = data?.items ?? [];
  const meta = data?.meta;

  const totalCount = meta?.totalCount ?? 0;
  const activeCount = useMemo(
    () => items.filter((row: UserAdminView) => row.status !== 'frozen').length,
    [items],
  );
  const frozenCount = useMemo(
    () => items.filter((row: UserAdminView) => row.status === 'frozen').length,
    [items],
  );

  const columns: ColumnDef<UserAdminView>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: '名前',
        accessorFn: (row) => row.user.name ?? row.user.email ?? '-',
        cell: ({ row }) => {
          const u = row.original.user;
          const initial = getInitial(u.name, u.email);
          return (
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-iris-10 text-body-sm font-semibold text-iris-100">
                {initial}
              </span>
              <span className="font-medium">{u.name ?? u.email ?? '-'}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'email',
        header: 'メール',
        accessorFn: (row) => row.user.email ?? '-',
        cell: ({ row }) => row.original.user.email ?? '-',
      },
      {
        accessorKey: 'globalRole',
        header: 'ロール',
        accessorFn: (row) => row.user.globalRole,
        cell: ({ row }) => (
          <Badge variant="role" value={row.original.user.globalRole} />
        ),
      },
      {
        accessorKey: 'status',
        header: 'ステータス',
        cell: ({ row }) => (
          <Badge variant="status" value={row.original.status} />
        ),
      },
      {
        accessorKey: 'createdAt',
        header: '登録日',
        accessorFn: (row) => row.user.createdAt,
        cell: ({ row }) =>
          new Date(row.original.user.createdAt).toLocaleDateString('ja-JP'),
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => {
          const u = row.original.user;
          const isFrozen = row.original.status === 'frozen';
          return (
            <div className="flex items-center gap-2">
              {isFrozen ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setFreezeModal({ mode: 'unfreeze', userId: u.id })}
                >
                  解除
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setFreezeModal({ mode: 'freeze', userId: u.id })}
                >
                  凍結
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          value={totalCount}
          label="総ユーザー数"
        />
        <StatCard
          icon={<UserCheck className="h-5 w-5" />}
          value={activeCount}
          label="アクティブ"
        />
        <StatCard
          icon={<UserX className="h-5 w-5" />}
          value={frozenCount}
          label="凍結中"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          variant="search"
          placeholder="名前・メールで検索"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          size="default"
          className="w-[320px]"
        />
      </div>

      <DataTable<UserAdminView, unknown>
        columns={columns}
        data={items}
        isLoading={isLoading}
        pagination={
          meta
            ? {
                page: meta.page,
                pageSize: meta.perPage,
                total: meta.totalCount ?? 0,
              }
            : undefined
        }
        onPageChange={setPage}
        pageSize={20}
      />

      {freezeModal && (
        <FreezeModal
          mode={freezeModal.mode}
          userId={freezeModal.userId}
          isOpen
          onClose={() => setFreezeModal(null)}
        />
      )}
    </div>
  );
}
