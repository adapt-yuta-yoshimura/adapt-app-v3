'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Divider,
} from '@adapt/ui';

// Next.js 15: params は Promise型
export default function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}): React.ReactNode {
  const { courseId, lessonId } = use(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/courses/${courseId}`}>← コースに戻る</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>レッスン</CardTitle>
            <Badge variant="outline">レッスンID: {lessonId}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            レッスンコンテンツは準備中です
          </p>
        </CardContent>
      </Card>

      <Divider />

      <div className="flex justify-between">
        <Button variant="outline">前のレッスン</Button>
        <Button>次のレッスン</Button>
      </div>
    </div>
  );
}
