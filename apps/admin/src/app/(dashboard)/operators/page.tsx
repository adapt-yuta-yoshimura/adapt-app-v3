'use client';

import Link from 'next/link';
import { useMemo, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import type { AdminApi } from '@adapt/types';

import { Badge, Button, DataTable } from '@/components/ui';
import { useAdminTitle } from '@/contexts/admin-title-context';
import { useAdminOperators } from '@/hooks/use-admin-operators';

type OperatorAdminView = AdminApi.components['schemas']['OperatorAdminView'];

/**
 * 運営スタッフ一覧（§2-D / API-076）
 * root_operator のみ表示可能（x-roles 準拠）
 */
export default function AdminOperatorsPage(): React.ReactNode {
  const setTitle = useAdminTitle();
  useEffect(() => {
    setTitle('運営スタッフ管理');
  }, [setTitle]);

  const { data, isLoading, error } = useAdminOperators();
  const items = useMemo(
    (): OperatorAdminView[] => data?.items ?? [],
    [data?.items],
  );

  const columns: ColumnDef<OperatorAdminView>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: '名前',
        accessorFn: (row: OperatorAdminView) => row.name ?? '-',
        cell: ({ row }) => row.original.name ?? '-',
      },
      {
        accessorKey: 'email',
        header: 'メール',
        accessorFn: (row: OperatorAdminView) => row.email ?? '-',
        cell: ({ row }) => row.original.email ?? '-',
      },
      {
        accessorKey: 'globalRole',
        header: 'ロール',
        cell: ({ row }) => (
          <Badge variant="role" value={row.original.globalRole} />
        ),
      },
      {
        accessorKey: 'createdAt',
        header: '登録日',
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString('ja-JP'),
      },
    ],
    [],
  );

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-card border border-red-200 bg-red-50 p-4">
          <div className="font-bold text-red-700">エラー</div>
          <div className="text-red-600">{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <Button variant="primary" size="md" asChild>
          <Link href="/operators/new">+ スタッフ追加</Link>
        </Button>
      </div>

      <DataTable<OperatorAdminView, unknown>
        columns={columns}
        data={items}
        isLoading={isLoading}
        pageSize={20}
      />
    </div>
  );
}
