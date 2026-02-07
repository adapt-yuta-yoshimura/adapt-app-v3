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
  Input,
  Grid,
} from '@adapt/ui';

import { useCourses } from '@/hooks/use-courses';

export default function CoursesPage(): React.ReactNode {
  const { data, isLoading } = useCourses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">コース一覧</h1>
          <p className="text-muted-foreground">受講中・受講可能なコース</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="コースを検索..."
          className="max-w-sm"
        />
        <Button variant="outline">検索</Button>
      </div>

      {isLoading ? (
        <Grid cols={3} gap="md">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-3 w-1/3 rounded bg-muted" />
              </CardContent>
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
                  <Link href={`/courses/${item.course.id}`}>詳細を見る</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            コースが見つかりませんでした
          </CardContent>
        </Card>
      )}

      {data?.meta.page && data.meta.page.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={data.meta.page.currentPage <= 1}>
            前のページ
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            {data.meta.page.currentPage} / {data.meta.page.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={data.meta.page.currentPage >= data.meta.page.totalPages}>
            次のページ
          </Button>
        </div>
      )}
    </div>
  );
}
