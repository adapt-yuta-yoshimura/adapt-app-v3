'use client';

/**
 * ADM-UI-13: 講座詳細・監査
 *
 * - Path: /admin/courses/[courseId]
 * - Figma（詳細）: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8355-2&m=dev
 * - Figma（審査パネル）: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8356-3&m=dev
 * - ロール: operator, root_operator（凍結解除は root_operator のみ）
 * - API: API-ADMIN-01（取得）、API-ADMIN-03〜08
 *
 * ADMIN-04チケット参照
 */

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchCourseList, fetchCourseAudit } from '@/lib/admin-courses-api';
import { CourseDetailPanel } from '@/components/features/course/course-detail-panel';
import { CourseReviewPanel } from '@/components/features/course/course-review-panel';

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId as string | undefined;
  const [showAudit, setShowAudit] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'courses', { page: 1, perPage: 100 }],
    queryFn: () => fetchCourseList({ page: 1, perPage: 100 }),
    enabled: !!courseId,
  });

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['admin', 'courses', 'audit', courseId],
    queryFn: () => fetchCourseAudit(courseId!),
    enabled: !!courseId && showAudit,
  });

  const course = data?.items.find((c) => c.id === courseId) ?? null;

  if (isLoading) {
    return (
      <div className="py-8 text-center text-textMuted">読み込み中...</div>
    );
  }

  if (!course) {
    return (
      <div className="py-8 text-center text-textMuted">
        講座が見つかりません
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">講座詳細</h1>
        <button
          type="button"
          onClick={() => {
            // ADM-UI-12 は未実装（INS-UI-05 作成後に対応）
            alert('編集画面は現在未実装です（INS-UI-05 作成後に対応予定）');
          }}
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-bg"
        >
          編集画面へ
        </button>
      </div>

      <CourseDetailPanel course={course} />
      <CourseReviewPanel course={course} courseId={courseId!} />

      {/* 監査ログ（API-ADMIN-08 閲覧時に記録される） */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-text">監査ログ</h2>
        {!showAudit && (
          <>
            <p className="text-sm text-textSecondary">
              監査ログを表示すると、閲覧が記録されます。
            </p>
            <button
              className="mt-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-bg"
              onClick={() => setShowAudit(true)}
            >
              監査ログを表示
            </button>
          </>
        )}
        {showAudit && auditLoading && (
          <p className="text-sm text-textMuted">読み込み中...</p>
        )}
        {showAudit && !auditLoading && auditData && (
          <div className="space-y-2">
            {auditData.auditEvents.length === 0 ? (
              <p className="text-sm text-textMuted">イベントはありません</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {auditData.auditEvents.map((ev) => (
                  <li key={ev.id} className="py-2">
                    <span className="text-textTertiary">
                      {new Date(ev.occurredAt).toLocaleString('ja-JP')}
                    </span>
                    {' — '}
                    <span className="font-medium">{ev.eventType}</span>
                    {' — '}
                    <span className="text-textSecondary">{ev.reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
