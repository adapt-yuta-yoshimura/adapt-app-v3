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
} from '@adapt/ui';

import { useCourse } from '@/hooks/use-course';

// Next.js 15: params は Promise型
export default function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): React.ReactNode {
  const { courseId } = use(params);
  const { data, isLoading, error } = useCourse(courseId);

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

  const { course, stats } = data;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/courses">← コース一覧</Link>
          </Button>
        </div>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
            {course.description && (
              <p className="mt-1 text-muted-foreground">{course.description}</p>
            )}
          </div>
          {course.isFrozen && <Badge variant="destructive">凍結中</Badge>}
        </div>
      </div>

      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{stats.memberCount} 名のメンバー</span>
        <span>{stats.channelCount} チャンネル</span>
      </div>

      <Divider />

      {/* レッスン一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">レッスン</CardTitle>
          <CardDescription>このコースのレッスン一覧</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            レッスンは準備中です
          </p>
        </CardContent>
      </Card>

      {/* チャンネル一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">チャンネル</CardTitle>
          <CardDescription>ディスカッション・質問</CardDescription>
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
            <p className="text-sm text-muted-foreground">
              チャンネルはまだありません
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
