'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Badge, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@adapt/ui';

import { DataTable } from '@/components/data-table';

interface PaymentRow {
  id: string;
  userName: string;
  courseTitle: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'destructive' | 'secondary' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'destructive';
    default:
      return 'secondary';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return '完了';
    case 'pending':
      return '処理中';
    case 'failed':
      return '失敗';
    case 'refunded':
      return '返金済み';
    default:
      return status;
  }
}

const columns: ColumnDef<PaymentRow>[] = [
  {
    accessorKey: 'id',
    header: '決済ID',
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.id.slice(0, 8)}...</span>
    ),
  },
  {
    accessorKey: 'userName',
    header: 'ユーザー',
  },
  {
    accessorKey: 'courseTitle',
    header: 'コース',
  },
  {
    accessorKey: 'amount',
    header: '金額',
    cell: ({ row }) =>
      `¥${row.original.amount.toLocaleString()}`,
  },
  {
    accessorKey: 'status',
    header: 'ステータス',
    cell: ({ row }) => (
      <Badge variant={getStatusBadgeVariant(row.original.status)}>
        {getStatusLabel(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: '日時',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('ja-JP'),
  },
  {
    id: 'actions',
    header: '',
    cell: () => (
      <Button variant="ghost" size="sm">
        詳細
      </Button>
    ),
  },
];

// TODO(ADAPT): API接続後にuseAdminPaymentsからデータ取得
const mockPayments: PaymentRow[] = [];

export default function AdminPaymentsPage(): React.ReactNode {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">決済管理</h1>
          <p className="text-muted-foreground">すべての決済取引の一覧</p>
        </div>
        <Button>CSV エクスポート</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">決済一覧</CardTitle>
          <CardDescription>すべての決済取引を表示しています</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={mockPayments}
            searchColumn="userName"
            searchPlaceholder="ユーザー名で検索..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
