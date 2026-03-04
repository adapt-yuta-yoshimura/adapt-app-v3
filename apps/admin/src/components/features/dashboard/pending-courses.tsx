'use client';

/**
 * 承認待ち講座パネル
 *
 * ADM-UI-02 で使用
 * SoT: openapi_admin.yaml - API-ADMIN-01（CourseListResponse, status=pending_approval）
 *
 * - ヘッダー: オレンジドット + 「承認待ち講座」 + 件数バッジ
 * - 各カード: 講座名、スタイルバッジ、講師（ownerUserId 表示）、申請日
 * - [承認] ボタン → API-ADMIN-05 / [詳細] → /admin/courses/[courseId]
 * - フッター: 「すべての承認待ちを表示」→ /admin/courses?status=pending_approval
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Eye } from 'lucide-react';
import { CourseStyleBadge } from '@/components/features/course/course-style-badge';
import type { CourseStyle } from '@/lib/admin-courses-api';
import { approveCourse } from '@/lib/admin-courses-api';

type PendingCourse = {
  id: string;
  title: string;
  style: CourseStyle;
  ownerUserId: string;
  approvalRequestedAt: string | null;
};

type PendingCoursesProps = {
  courses: PendingCourse[];
  isLoading: boolean;
  onApproved?: () => void;
};

function formatDate(isoString: string | null): string {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function PendingCourses({
  courses,
  isLoading,
  onApproved,
}: PendingCoursesProps) {
  const router = useRouter();

  const handleApprove = async (courseId: string) => {
    try {
      await approveCourse(courseId);
      onApproved?.();
      router.refresh();
    } catch (err) {
      // エラーは API クライアントが throw するので呼び出し元でハンドリング可能
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[12px] border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-warning" aria-hidden />
          <h3 className="text-lg font-semibold text-text">承認待ち講座</h3>
          <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium text-warning">
            -
          </span>
        </div>
        <div className="mt-4 py-8 text-center text-sm text-textMuted">
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[12px] border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-card p-4">
        <span className="h-2 w-2 shrink-0 rounded-full bg-warning" aria-hidden />
        <h3 className="text-lg font-semibold text-text">承認待ち講座</h3>
        <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium text-warning">
          {courses.length}件
        </span>
      </div>
      <ul className="divide-y divide-border">
        {courses.length === 0 ? (
          <li className="py-6 text-center text-sm text-textMuted">
            承認待ちの講座はありません
          </li>
        ) : (
          courses.map((course) => (
            <li key={course.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text">{course.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-textSecondary">
                    <CourseStyleBadge style={course.style} />
                    <span>講師: {course.ownerUserId}</span>
                    <span>·</span>
                    <span>申請日: {formatDate(course.approvalRequestedAt)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => handleApprove(course.id)}
                    className="inline-flex items-center gap-1 rounded-md bg-success px-2 py-1.5 text-sm font-medium text-white hover:bg-success/90"
                    aria-label={`講座「${course.title}」を承認`}
                  >
                    <Check className="h-4 w-4" />
                    承認
                  </button>
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1.5 text-sm font-medium text-text hover:bg-bg"
                    aria-label={`講座「${course.title}」の詳細`}
                  >
                    <Eye className="h-4 w-4" />
                    詳細
                  </Link>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
      <div className="border-t border-border p-4">
        <Link
          href="/admin/courses?status=pending_approval"
          className="text-sm font-medium text-accent hover:underline"
        >
          すべての承認待ちを表示
        </Link>
      </div>
    </div>
  );
}
