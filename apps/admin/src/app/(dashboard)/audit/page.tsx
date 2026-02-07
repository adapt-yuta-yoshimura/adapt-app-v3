'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Badge, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@adapt/ui';

import { DataTable } from '@/components/data-table';

interface AuditLogRow {
  id: string;
  action: string;
  actorEmail: string;
  actorName: string;
  targetType: string;
  targetId: string;
  details: string | null;
  ipAddress: string;
  createdAt: string;
}

function getActionBadgeVariant(action: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (action.startsWith('delete') || action.startsWith('remove')) return 'destructive';
  if (action.startsWith('create') || action.startsWith('add')) return 'default';
  if (action.startsWith('update') || action.startsWith('edit')) return 'secondary';
  return 'outline';
}

function getActionLabel(action: string): string {
  switch (action) {
    case 'create_course':
      return 'コース作成';
    case 'update_course':
      return 'コース更新';
    case 'delete_course':
      return 'コース削除';
    case 'freeze_course':
      return 'コース凍結';
    case 'unfreeze_course':
      return 'コース凍結解除';
    case 'create_user':
      return 'ユーザー作成';
    case 'update_user':
      return 'ユーザー更新';
    case 'delete_user':
      return 'ユーザー削除';
    case 'admin_login':
      return '管理者ログイン';
    case 'admin_logout':
      return '管理者ログアウト';
    default:
      return action;
  }
}

const columns: ColumnDef<AuditLogRow>[] = [
  {
    accessorKey: 'createdAt',
    header: '日時',
    cell: ({ row }) => (
      <span className="text-xs">
        {new Date(row.original.createdAt).toLocaleString('ja-JP')}
      </span>
    ),
  },
  {
    accessorKey: 'action',
    header: 'アクション',
    cell: ({ row }) => (
      <Badge variant={getActionBadgeVariant(row.original.action)}>
        {getActionLabel(row.original.action)}
      </Badge>
    ),
  },
  {
    accessorKey: 'actorName',
    header: '実行者',
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium">{row.original.actorName}</p>
        <p className="text-xs text-muted-foreground">{row.original.actorEmail}</p>
      </div>
    ),
  },
  {
    accessorKey: 'targetType',
    header: '対象',
    cell: ({ row }) => (
      <div>
        <p className="text-sm">{row.original.targetType}</p>
        <p className="font-mono text-xs text-muted-foreground">
          {row.original.targetId.slice(0, 8)}...
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'details',
    header: '詳細',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.details ?? '-'}
      </span>
    ),
  },
  {
    accessorKey: 'ipAddress',
    header: 'IPアドレス',
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.ipAddress}</span>
    ),
  },
];

// TODO(ADAPT): API接続後にデータ取得
const mockAuditLogs: AuditLogRow[] = [];

export default function AdminAuditPage(): React.ReactNode {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">監査ログ</h1>
        <p className="text-muted-foreground">管理画面での操作履歴</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">操作ログ</CardTitle>
          <CardDescription>管理者による操作の記録</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={mockAuditLogs}
            searchColumn="actorName"
            searchPlaceholder="実行者を検索..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
