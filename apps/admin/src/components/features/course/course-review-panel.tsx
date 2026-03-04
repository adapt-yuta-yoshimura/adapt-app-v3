'use client';

/**
 * 講座審査パネル（承認・凍結・凍結解除・削除）
 *
 * ADM-UI-13 で使用
 * Figma: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8356-3&m=dev
 *
 * SoT: openapi_admin.yaml
 * - API-ADMIN-04: DELETE（削除 → archived）
 * - API-ADMIN-05: POST /approve（承認 → active）
 * - API-ADMIN-06: POST /freeze（凍結）
 * - API-ADMIN-07: POST /unfreeze（凍結解除、root_operator のみ）
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { CourseAdminView } from '@/lib/admin-courses-api';
import {
  approveCourse,
  freezeCourse,
  unfreezeCourse,
  deleteCourse,
} from '@/lib/admin-courses-api';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type CourseReviewPanelProps = {
  course: CourseAdminView;
  courseId: string;
};

export function CourseReviewPanel({
  course,
  courseId,
}: CourseReviewPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<
    'approve' | 'freeze' | 'unfreeze' | 'delete' | null
  >(null);
  const [freezeReason, setFreezeReason] = React.useState('');

  const invalidateAndRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
  };

  const handleConfirm = async () => {
    setError(null);
    try {
      switch (confirmAction) {
        case 'approve':
          await approveCourse(courseId);
          break;
        case 'freeze':
          await freezeCourse(courseId, freezeReason.trim() || undefined);
          setFreezeReason('');
          break;
        case 'unfreeze':
          await unfreezeCourse(courseId);
          break;
        case 'delete':
          await deleteCourse(courseId);
          await invalidateAndRefresh();
          router.push('/admin/courses');
          return;
      }
      await invalidateAndRefresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '操作に失敗しました';
      setError(message);
    }
  };

  const confirmConfig = {
    approve: {
      title: '講座を承認しますか？',
      description:
        'ステータスが「運用中」に変更されます。この操作は元に戻せません。',
      confirmLabel: '承認する',
      variant: 'default' as const,
    },
    freeze: {
      title: '講座を凍結しますか？',
      description:
        '講座が凍結され、すべての更新操作が制限されます。',
      confirmLabel: '凍結する',
      variant: 'danger' as const,
    },
    unfreeze: {
      title: '講座の凍結を解除しますか？',
      description: '講座の凍結状態が解除されます。',
      confirmLabel: '凍結解除',
      variant: 'default' as const,
    },
    delete: {
      title: '講座を削除しますか？',
      description:
        '講座がアーカイブされます。この操作は元に戻せません。',
      confirmLabel: '削除する',
      variant: 'danger' as const,
    },
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold text-text">審査・操作</h2>

      {error && (
        <div className="mb-4 rounded-md bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {/* 承認ボタン: pending_approval のときのみ表示 */}
        {course.status === 'pending_approval' && (
          <button
            type="button"
            onClick={() => setConfirmAction('approve')}
            className="rounded-md bg-success px-4 py-2 text-sm text-white hover:bg-success/90"
          >
            承認する
          </button>
        )}

        {/* 凍結ボタン: 凍結されていないとき */}
        {!course.isFrozen && course.status !== 'archived' && (
          <button
            type="button"
            onClick={() => setConfirmAction('freeze')}
            className="rounded-md bg-warning px-4 py-2 text-sm text-white hover:bg-warning/90"
          >
            凍結する
          </button>
        )}

        {/* 凍結解除ボタン: 凍結中のとき（root_operator のみ: API側で制御） */}
        {course.isFrozen && (
          <button
            type="button"
            onClick={() => setConfirmAction('unfreeze')}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-bg"
          >
            凍結解除（root_operator のみ）
          </button>
        )}

        {/* 削除ボタン: archived でないとき */}
        {course.status !== 'archived' && (
          <button
            type="button"
            onClick={() => setConfirmAction('delete')}
            className="rounded-md bg-error px-4 py-2 text-sm text-white hover:bg-error/90"
          >
            削除する
          </button>
        )}
      </div>

      {/* 確認ダイアログ */}
      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={(open) => {
            if (!open) {
              setConfirmAction(null);
              setFreezeReason('');
            }
          }}
          title={confirmConfig[confirmAction].title}
          description={confirmConfig[confirmAction].description}
          confirmLabel={confirmConfig[confirmAction].confirmLabel}
          variant={confirmConfig[confirmAction].variant}
          onConfirm={handleConfirm}
          children={
            confirmAction === 'freeze' ? (
              <div>
                <label
                  htmlFor="freeze-reason"
                  className="block text-sm font-medium text-textSecondary"
                >
                  理由（任意）
                </label>
                <textarea
                  id="freeze-reason"
                  rows={2}
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  placeholder="凍結理由を入力..."
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
