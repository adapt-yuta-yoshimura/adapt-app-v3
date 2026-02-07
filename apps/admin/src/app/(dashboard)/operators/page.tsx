'use client';

import Link from 'next/link';
import { type ColumnDef } from '@tanstack/react-table';
import { Badge, Button } from '@adapt/ui';
import { PlatformRole } from '@adapt/shared';

import { DataTable } from '@/components/data-table';

/**
 * 一覧行用（API-076 OperatorListResponse.items 相当）
 * モック表示用。API 連携時は OperatorAdminView[] に差し替える。
 */
interface OperatorRow {
  id: string;
  userId: string;
  role: PlatformRole;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string | null;
    email: string | null;
    isActive: boolean;
  };
}

function getRoleBadgeVariant(role: string): 'root_operator' | 'operator' {
  return role === PlatformRole.ROOT_OPERATOR ? 'root_operator' : 'operator';
}

function getRoleLabel(role: string): string {
  return role === PlatformRole.ROOT_OPERATOR ? 'root_operator' : 'operator';
}

const columns: ColumnDef<OperatorRow>[] = [
  {
    accessorKey: 'displayName',
    header: '名前',
    accessorFn: (row) => row.user?.name ?? '-',
    cell: ({ row }) => row.original.user?.name ?? '-',
  },
  {
    accessorKey: 'email',
    header: 'メール',
    accessorFn: (row) => row.user?.email ?? '-',
    cell: ({ row }) => row.original.user?.email ?? '-',
  },
  {
    accessorKey: 'role',
    header: 'ロール',
    cell: ({ row }) => (
      <Badge variant={getRoleBadgeVariant(row.original.role)}>
        {getRoleLabel(row.original.role)}
      </Badge>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'ステータス',
    accessorFn: (row) => row.user?.isActive ?? true,
    cell: ({ row }) => {
      const isActive = row.original.user?.isActive ?? true;
      return (
        <Badge variant={isActive ? 'active' : 'inactive'}>
          {isActive ? '有効' : '無効'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: '作成日',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('ja-JP'),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Button variant="outline" size="sm" asChild>
        <Link href={`/operators/${row.original.id}`}>編集</Link>
      </Button>
    ),
  },
];

/**
 * モックデータ（API 連携不要。3件・ドメイン adapt-co.io）
 */
const MOCK_OPERATORS: OperatorRow[] = [
  {
    id: 'op-1',
    userId: 'user-1',
    role: PlatformRole.ROOT_OPERATOR,
    createdAt: '2024-01-15T09:00:00.000Z',
    updatedAt: '2025-02-01T10:00:00.000Z',
    user: {
      name: '山田 太郎',
      email: 'yamada@adapt-co.io',
      isActive: true,
    },
  },
  {
    id: 'op-2',
    userId: 'user-2',
    role: PlatformRole.ROOT_OPERATOR,
    createdAt: '2024-03-20T09:00:00.000Z',
    updatedAt: '2025-01-10T10:00:00.000Z',
    user: {
      name: '佐藤 花子',
      email: 'sato@adapt-co.io',
      isActive: true,
    },
  },
  {
    id: 'op-3',
    userId: 'user-3',
    role: PlatformRole.OPERATOR,
    createdAt: '2024-06-01T09:00:00.000Z',
    updatedAt: '2025-02-05T10:00:00.000Z',
    user: {
      name: '鈴木 一郎',
      email: 'suzuki@adapt-co.io',
      isActive: false,
    },
  },
];

function useOperatorStats(operators: OperatorRow[]) {
  const total = operators.length;
  const rootCount = operators.filter((o) => o.role === PlatformRole.ROOT_OPERATOR).length;
  const operatorCount = operators.filter((o) => o.role === PlatformRole.OPERATOR).length;
  return { total, rootCount, operatorCount };
}

export default function AdminOperatorsPage(): React.ReactNode {
  const items = MOCK_OPERATORS;
  const { total, rootCount, operatorCount } = useOperatorStats(items);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">運営スタッフ</h1>
          <p className="mt-1 text-body-sm text-text-secondary">
            運営アカウント（operator / root_operator）の管理
          </p>
        </div>
        <Button asChild>
          <Link href="/operators/new">＋ スタッフ追加</Link>
        </Button>
      </div>

      {/* 統計カード: 白背景・border・rounded-card・数値 24px Bold */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-border bg-white px-5 py-4">
          <p className="text-caption font-semibold text-text-secondary">総スタッフ数</p>
          <p className="text-[24px] font-bold text-iris-100">{total}</p>
        </div>
        <div className="rounded-card border border-border bg-white px-5 py-4">
          <p className="text-caption font-semibold text-text-secondary">root_operator数</p>
          <p className="text-[24px] font-bold text-fuschia-100">{rootCount}</p>
        </div>
        <div className="rounded-card border border-border bg-white px-5 py-4">
          <p className="text-caption font-semibold text-text-secondary">operator数</p>
          <p className="text-[24px] font-bold text-semantic-success">{operatorCount}</p>
        </div>
      </div>

      {/* テーブル: §2.4 Table 仕様（DataTable が Table コンポーネントを使用） */}
      <DataTable
        columns={columns}
        data={items}
        searchColumn="displayName"
        searchPlaceholder="スタッフを検索..."
        pageSize={10}
      />
    </div>
  );
}
