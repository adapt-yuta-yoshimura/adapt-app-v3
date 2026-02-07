'use client';

import Link from 'next/link';
import { type ColumnDef } from '@tanstack/react-table';
import { Badge, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@adapt/ui';

import { DataTable } from '@/components/data-table';

interface CourseRow {
  id: string;
  title: string;
  instructorName: string;
  memberCount: number;
  isFrozen: boolean;
  createdAt: string;
}

const columns: ColumnDef<CourseRow>[] = [
  {
    accessorKey: 'title',
    header: 'コース名',
    cell: ({ row }) => (
      <Link
        href={`/courses/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: 'instructorName',
    header: '講師',
  },
  {
    accessorKey: 'memberCount',
    header: 'メンバー数',
    cell: ({ row }) => `${row.original.memberCount} 名`,
  },
  {
    accessorKey: 'isFrozen',
    header: 'ステータス',
    cell: ({ row }) => (
      <Badge variant={row.original.isFrozen ? 'destructive' : 'success'}>
        {row.original.isFrozen ? '凍結中' : '有効'}
      </Badge>
    ),
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
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/courses/${row.original.id}`}>詳細</Link>
      </Button>
    ),
  },
];

// TODO(ADAPT): API接続後にuseAdminCoursesからデータ取得
const mockCourses: CourseRow[] = [];

export default function AdminCoursesPage(): React.ReactNode {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">コース管理</h1>
          <p className="text-muted-foreground">すべてのコースの一覧と管理</p>
        </div>
        <Button>CSV エクスポート</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">コース一覧</CardTitle>
          <CardDescription>全コースを表示しています</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={mockCourses}
            searchColumn="title"
            searchPlaceholder="コースを検索..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
