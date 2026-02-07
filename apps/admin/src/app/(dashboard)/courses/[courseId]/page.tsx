'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Divider,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Grid,
} from '@adapt/ui';

import { useAdminCourseDetail } from '@/hooks/use-admin-courses';

// Next.js 15: params は Promise型
export default function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): React.ReactNode {
  const { courseId } = use(params);
  const { data, isLoading, error } = useAdminCourseDetail(courseId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <Card className="animate-pulse">
          <CardContent className="py-8">
            <div className="h-4 w-full rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          コースが見つかりませんでした
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/courses">← コース一覧</Link>
        </Button>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{data.title}</h1>
            {data.description && (
              <p className="mt-1 text-muted-foreground">{data.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={data.isFrozen ? 'destructive' : 'success'}>
              {data.isFrozen ? '凍結中' : '有効'}
            </Badge>
            <Button variant="outline" size="sm">
              {data.isFrozen ? '凍結解除' : 'コースを凍結'}
            </Button>
          </div>
        </div>
      </div>

      <Grid cols={3} gap="md">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>メンバー数</CardDescription>
            <CardTitle className="text-2xl">{data.stats.memberCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>チャンネル数</CardDescription>
            <CardTitle className="text-2xl">{data.stats.channelCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>メッセージ数</CardDescription>
            <CardTitle className="text-2xl">{data.stats.messageCount}</CardTitle>
          </CardHeader>
        </Card>
      </Grid>

      <Divider />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">メンバー</CardTitle>
          <CardDescription>コースに参加しているメンバー</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>メールアドレス</TableHead>
                <TableHead>ロール</TableHead>
                <TableHead>参加日</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.members.length > 0 ? (
                data.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.displayName}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.joinedAt).toLocaleDateString('ja-JP')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    メンバーはいません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">チャンネル</CardTitle>
          <CardDescription>コース内のチャンネル一覧</CardDescription>
        </CardHeader>
        <CardContent>
          {data.channels.length > 0 ? (
            <ul className="space-y-2">
              {data.channels.map((ch) => (
                <li key={ch.id} className="flex items-center gap-2 rounded-md border p-3">
                  <span className="text-sm font-medium">{ch.name ?? ch.type}</span>
                  <Badge variant="outline" className="text-xs">{ch.type}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">チャンネルはありません</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">コース情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">コースID</span>
            <span className="font-mono">{data.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">作成日</span>
            <span>{new Date(data.createdAt).toLocaleString('ja-JP')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">更新日</span>
            <span>{new Date(data.updatedAt).toLocaleString('ja-JP')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
