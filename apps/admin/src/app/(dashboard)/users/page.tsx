'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@adapt/ui';
import { GlobalRole, type UserAdminView } from '@adapt/shared';

import { DataTable } from '@/components/data-table';
import { useAdminUsers } from '@/hooks/use-admin-users';
import { adminApiClient } from '@/lib/api-client';

const ALL_ROLE_VALUE = '__all__';
const ALL_STATUS_VALUE = '__all__';

/** ロールフィルター値（全ロール / instructor / learner / assistant） */
const ROLE_OPTIONS = [
  { value: ALL_ROLE_VALUE, label: '全ロール' },
  { value: GlobalRole.INSTRUCTOR, label: 'instructor' },
  { value: GlobalRole.LEARNER, label: 'learner' },
  { value: GlobalRole.ASSISTANT, label: 'assistant' },
] as const;

/** ステータスフィルター値（全ステータス / 有効 / 凍結） */
const STATUS_OPTIONS = [
  { value: ALL_STATUS_VALUE, label: '全ステータス' },
  { value: 'active', label: '有効' },
  { value: 'frozen', label: '凍結' },
] as const;

function getRoleBadgeVariant(
  role: string,
): 'instructor' | 'learner' | 'assistant' | 'root_operator' | 'operator' {
  if (role === GlobalRole.INSTRUCTOR) return 'instructor';
  if (role === GlobalRole.LEARNER) return 'learner';
  if (role === GlobalRole.ASSISTANT) return 'assistant';
  if (role === GlobalRole.ROOT_OPERATOR) return 'root_operator';
  if (role === GlobalRole.OPERATOR) return 'operator';
  return 'learner';
}

function getRoleLabel(role: string): string {
  return role;
}

function getInitial(name: string | null, email: string | null): string {
  if (name?.trim()) {
    return name.trim().slice(0, 1).toUpperCase();
  }
  if (email?.trim()) {
    return email.trim().slice(0, 1).toUpperCase();
  }
  return '?';
}

/**
 * ユーザー管理一覧（API-074 GET /api/v1/admin/users）
 * §2.4 Table / §2.3 Badge 準拠
 */
export default function AdminUsersPage(): React.ReactNode {
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const roleParam = roleFilter && roleFilter !== ALL_ROLE_VALUE ? roleFilter : undefined;
  const statusParam = statusFilter && statusFilter !== ALL_STATUS_VALUE ? statusFilter : undefined;
  const { data, isLoading } = useAdminUsers(1, 20, q || undefined, roleParam, statusParam);

  const freezeMutation = useMutation({
    mutationFn: async (userId: string) => {
      await adminApiClient.post(`/api/v1/admin/users/${userId}/freeze`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const unfreezeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const path = `/api/v1/admin/users/${userId}/unfreeze`;
      console.log('API-075B:', path, { userId });
      await adminApiClient.post(path, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const items = data?.items ?? [];
  const filteredItems = useMemo(() => {
    let list = items;
    if (roleParam) {
      list = list.filter((row) => row.user.globalRole === roleParam);
    }
    if (statusParam) {
      list = list.filter((row) => row.status === statusParam);
    }
    return list;
  }, [items, roleParam, statusParam]);

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
              <Avatar className="h-[30px] w-[30px] rounded-full bg-iris-20 text-iris-100">
                <AvatarFallback className="rounded-full bg-iris-20 text-body-sm font-semibold text-iris-100">
                  {initial}
                </AvatarFallback>
              </Avatar>
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
          <Badge variant={getRoleBadgeVariant(row.original.user.globalRole)}>
            {getRoleLabel(row.original.user.globalRole)}
          </Badge>
        ),
      },
      {
        id: 'courseCount',
        header: 'コース数',
        cell: () => '-',
      },
      {
        accessorKey: 'status',
        header: 'ステータス',
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'frozen' ? 'frozen' : 'active'}>
            {row.original.status === 'frozen' ? '凍結' : '有効'}
          </Badge>
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
        header: 'アクション',
        cell: ({ row }) => {
          const u = row.original.user;
          const isFrozen = row.original.status === 'frozen';
          return (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/users/${u.id}`}>詳細</Link>
              </Button>
              {isFrozen ? (
                <Button
                  variant="danger-outline"
                  size="sm"
                  disabled={unfreezeMutation.isPending}
                  onClick={() => unfreezeMutation.mutate(u.id)}
                >
                  解除
                </Button>
              ) : (
                <Button
                  variant="danger-outline"
                  size="sm"
                  disabled={freezeMutation.isPending}
                  onClick={() => freezeMutation.mutate(u.id)}
                >
                  凍結
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [freezeMutation.isPending, unfreezeMutation.isPending],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ユーザー管理</h1>
        <p className="mt-1 text-body-sm text-text-secondary">
          登録ユーザーの一覧と管理（API-074）
        </p>
      </div>

      {/* フィルター行: 横並び gap 12px */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="名前・メールで検索..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-[38px] w-[320px]"
        />
        <Select
          value={roleFilter || ALL_ROLE_VALUE}
          onValueChange={(v) => setRoleFilter(v === ALL_ROLE_VALUE ? '' : v)}
        >
          <SelectTrigger className="h-[38px] w-[140px]">
            <SelectValue placeholder="全ロール" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter || ALL_STATUS_VALUE}
          onValueChange={(v) => setStatusFilter(v === ALL_STATUS_VALUE ? '' : v)}
        >
          <SelectTrigger className="h-[38px] w-[140px]">
            <SelectValue placeholder="全ステータス" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* テーブル §2.4 準拠 */}
      {isLoading ? (
        <p className="text-body-sm text-text-secondary">読み込み中...</p>
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          pageSize={20}
        />
      )}
    </div>
  );
}
