'use client';

/**
 * 講座審査パネル（操作ボタン群 + 確認モーダル）
 *
 * ADM-UI-13 で使用
 * Figma JSX 準拠: 承認 / 凍結(理由必須) / 凍結解除 / 論理削除モーダル
 *
 * SoT: openapi_admin.yaml
 * - API-ADMIN-04: DELETE（論理削除 → archived）
 * - API-ADMIN-05: POST /approve（承認 → active）
 * - API-ADMIN-06: POST /freeze（凍結）
 * - API-ADMIN-07: POST /unfreeze（凍結解除、root_operator のみ）
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Pencil, CheckCircle, Snowflake, Sun, Trash2 } from 'lucide-react';
import type { CourseAdminView } from '@/lib/admin-courses-api';
import {
  approveCourse,
  freezeCourse,
  unfreezeCourse,
  deleteCourse,
} from '@/lib/admin-courses-api';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CourseStatusBadge } from './course-status-badge';

export type ConfirmActionType =
  | 'approve'
  | 'freeze'
  | 'unfreeze'
  | 'delete'
  | null;

type CourseReviewPanelProps = {
  course: CourseAdminView;
  courseId: string;
  /** 親（ページ）から制御する場合。バナー内ボタンからモーダルを開くために使用 */
  confirmAction?: ConfirmActionType;
  onConfirmActionChange?: (action: ConfirmActionType) => void;
};

export function CourseReviewPanel({
  course,
  courseId,
  confirmAction: confirmActionProp,
  onConfirmActionChange,
}: CourseReviewPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);
  const [internalAction, setInternalAction] =
    React.useState<ConfirmActionType>(null);
  const [freezeReason, setFreezeReason] = React.useState('');

  const isControlled =
    confirmActionProp !== undefined && onConfirmActionChange !== undefined;
  const confirmAction = isControlled ? confirmActionProp : internalAction;
  const setConfirmAction = isControlled
    ? (onConfirmActionChange as (a: ConfirmActionType) => void)
    : setInternalAction;

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
      title: '講座承認の確認',
      warningBanner: undefined as React.ReactNode | undefined,
      infoBlock: (
        <>
          <div><strong>講座:</strong> {course.title}</div>
          <div><strong>講師（ID）:</strong> {course.ownerUserId}</div>
          <div><strong>現在のステータス:</strong> <CourseStatusBadge status={course.status} /></div>
          <div><strong>承認後:</strong> <CourseStatusBadge status="active" /> — LP公開</div>
        </>
      ),
      confirmLabel: '承認する',
      variant: 'success' as const,
    },
    freeze: {
      title: '講座凍結の確認',
      warningBanner: (
        <div className="rounded-lg bg-[#eff6ff] p-4 text-[13px] font-semibold text-[#1d4ed8]">
          凍結すると全ユーザーのアクセスが 423 Locked に制限されます
        </div>
      ),
      infoBlock: (
        <>
          <div><strong>講座:</strong> {course.title}（{course.id}）</div>
          <div><strong>講師（ID）:</strong> {course.ownerUserId}</div>
        </>
      ),
      confirmLabel: '凍結する',
      variant: 'freeze' as const,
    },
    unfreeze: {
      title: '凍結解除の確認',
      infoBlock: (
        <>
          <div className="mb-2 rounded-lg bg-success/10 p-3 text-[13px] font-semibold text-success">
            凍結を解除し、通常アクセスを復帰させます
          </div>
          <div><strong>講座:</strong> {course.title}（{course.id}）</div>
          <div><strong>凍結日時:</strong> {course.frozenAt ? new Date(course.frozenAt).toLocaleString('ja-JP') : '—'}</div>
          <div><strong>凍結理由:</strong> {course.freezeReason ?? '—'}</div>
        </>
      ),
      confirmLabel: '凍結解除する',
      variant: 'unfreeze' as const,
      warningBanner: undefined as React.ReactNode | undefined,
    },
    delete: {
      title: '講座の論理削除',
      warningBanner: (
        <div className="rounded-lg bg-[#fef2f2] p-4 text-[13px] font-semibold text-[#dc2626]">
          この操作は講座を archived ステータスに変更します
        </div>
      ),
      infoBlock: (
        <>
          <div><strong>講座:</strong> {course.title}（{course.id}）</div>
          <div><strong>現在のステータス:</strong> <CourseStatusBadge status={course.status} /></div>
          <div><strong>削除後:</strong> <CourseStatusBadge status="archived" /></div>
        </>
      ),
      confirmLabel: '削除する',
      variant: 'danger' as const,
    },
  };

  return (
    <>
      {/* 操作ボタン群カード（Figma: 操作: 代理編集 / 承認 / 凍結 / 論理削除） */}
      <div className="rounded-xl border border-border bg-card px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-semibold text-textMuted">操作:</span>
          <ActionBtn
            icon={Pencil}
            label="代理編集"
            className="rounded-lg border border-border bg-card px-4 py-2 text-[13px] font-semibold text-textSecondary hover:bg-bg"
            onClick={() => {
              // ADM-UI-12 は未実装（INS-UI-05 作成後に対応）
              alert(
                '編集画面は現在未実装です（INS-UI-05 作成後に対応予定）',
              );
            }}
          />
          {course.status === 'pending_approval' && !course.isFrozen && (
            <ActionBtn
              icon={CheckCircle}
              label="承認"
              className="rounded-lg border-0 bg-success px-4 py-2 text-[13px] font-semibold text-white hover:bg-success/90"
              onClick={() => setConfirmAction('approve')}
            />
          )}
          {!course.isFrozen && course.status !== 'archived' && (
            <ActionBtn
              icon={Snowflake}
              label="凍結"
              className="rounded-lg border-0 bg-[#1d4ed8] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1d4ed8]/90"
              onClick={() => setConfirmAction('freeze')}
            />
          )}
          {course.isFrozen && (
            <ActionBtn
              icon={Sun}
              label="凍結解除"
              className="rounded-lg border border-[#93C5FD] bg-[#dbeafe] px-4 py-2 text-[13px] font-semibold text-[#1d4ed8] hover:bg-[#bfdbfe]"
              onClick={() => setConfirmAction('unfreeze')}
            />
          )}
          <div className="flex-1" />
          <ActionBtn
            icon={Trash2}
            label="論理削除"
            className="rounded-lg border border-[#fecaca] bg-error/10 px-4 py-2 text-[13px] font-semibold text-error hover:bg-error/20"
            onClick={() => setConfirmAction('delete')}
            disabled={course.status === 'archived'}
          />
        </div>
        {error && (
          <div className="mt-3 rounded-md bg-error/10 px-3 py-2 text-sm text-error">
            {error}
          </div>
        )}
      </div>

      {/* 確認ダイアログ（JSX 準拠: ヘッダー+閉じるX / 警告バナー / 情報ブロック / ボタン） */}
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
          confirmLabel={confirmConfig[confirmAction].confirmLabel}
          variant={confirmConfig[confirmAction].variant}
          onConfirm={handleConfirm}
          warningBanner={confirmConfig[confirmAction].warningBanner}
          infoBlock={confirmConfig[confirmAction].infoBlock}
          confirmDisabled={
            confirmAction === 'freeze' ? !freezeReason.trim() : false
          }
        >
          {confirmAction === 'freeze' ? (
            <div>
              <label
                htmlFor="freeze-reason"
                className="mb-2 block text-[13px] font-semibold text-textSecondary"
              >
                凍結理由 <span className="text-error">*</span>
              </label>
              <textarea
                id="freeze-reason"
                rows={3}
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                placeholder="凍結理由を入力してください（監査ログに記録されます）"
                className="w-full resize-y rounded-lg border border-border bg-card px-3.5 py-2.5 text-[14px] text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          ) : undefined}
        </ConfirmDialog>
      )}
    </>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  className,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 ${className} ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
