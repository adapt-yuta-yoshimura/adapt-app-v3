'use client';

import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Grid,
} from '@adapt/ui';

import { useMyCourses } from '@/hooks/use-courses';

export default function DashboardPage(): React.ReactNode {
  const { data, isLoading } = useMyCourses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground">受講中のコースと最近のアクティビティ</p>
      </div>

      {/* 統計カード */}
      <Grid cols={3} gap="md">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>受講中のコース</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? '-' : (data?.items.length ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>未提出の課題</CardDescription>
            <CardTitle className="text-3xl">-</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>未読メッセージ</CardDescription>
            <CardTitle className="text-3xl">-</CardTitle>
          </CardHeader>
        </Card>
      </Grid>

      {/* コース一覧 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">受講中のコース</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/courses">すべて見る</Link>
          </Button>
        </div>

        {isLoading ? (
          <Grid cols={3} gap="md">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
                </CardHeader>
              </Card>
            ))}
          </Grid>
        ) : data?.items.length ? (
          <Grid cols={3} gap="md">
            {data.items.map((item) => (
              <Card key={item.course.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{item.course.title}</CardTitle>
                    {item.isFrozen && <Badge variant="secondary">凍結中</Badge>}
                  </div>
                  <CardDescription>
                    {item.course.description ?? '説明なし'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{item.memberCount} 名</span>
                    <span>{item.channelCount} チャンネル</span>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href={`/courses/${item.course.id}`}>開く</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Grid>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              まだコースに参加していません
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
