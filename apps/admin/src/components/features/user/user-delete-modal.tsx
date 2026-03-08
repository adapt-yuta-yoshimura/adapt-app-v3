'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteUser } from '@/lib/admin-users-api';
import type { UserModalUser } from './user-modal-types';

export interface UserDeleteModalProps {
  open: boolean;
  onClose: () => void;
  user: UserModalUser | null;
  /** 成功時に呼ぶ（一覧の場合は refetch、詳細の場合は redirect 等） */
  onSuccess: () => void | Promise<void>;
  /** 詳細画面から削除した場合、成功後に遷移するパス（例: /admin/learners, /admin/instructors） */
  redirectTo?: string;
}

/**
 * ユーザー削除確認モーダル（一覧・詳細共通）
 */
export function UserDeleteModal({
  open,
  onClose,
  user,
  onSuccess,
  redirectTo,
}: UserDeleteModalProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await deleteUser(user.id);
      await onSuccess();
      onClose();
      if (redirectTo) {
        router.push(redirectTo);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="user-delete-modal-title"
        className="relative z-10 mx-4 w-full max-w-[480px] overflow-hidden rounded-xl bg-card shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 id="user-delete-modal-title" className="text-lg font-bold text-text">
            ユーザー削除の確認
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-textMuted hover:bg-bg hover:text-text"
            aria-label="閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="mb-4 rounded-lg bg-[#fef2f2] p-3 text-[13px] font-semibold text-[#dc2626]">
            この操作は取り消せません。ユーザーは論理削除されます。
          </div>
          <div className="mb-4 rounded-lg bg-bg p-4 text-[13px] leading-relaxed text-textSecondary">
            <div><strong>ユーザー名:</strong> {user?.name ?? '—'}</div>
            <div><strong>メール:</strong> {user?.email ?? '—'}</div>
            <div><strong>ロール:</strong> {user?.globalRole ?? '—'}</div>
          </div>
          <p className="mb-5 text-sm text-textTertiary">
            削除後も監査ログは保持されます。物理削除は行われません。
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-card px-6 py-2.5 text-sm font-medium text-textSecondary hover:bg-bg"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="rounded-lg bg-[#dc2626] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#dc2626]/90 disabled:opacity-50"
            >
              {loading ? '処理中...' : '削除する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
