'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { unfreezeUser } from '@/lib/admin-users-api';
import type { UserModalUser } from './user-modal-types';

export interface UserUnfreezeModalProps {
  open: boolean;
  onClose: () => void;
  user: UserModalUser | null;
  onSuccess: () => void | Promise<void>;
}

/**
 * ユーザー凍結解除確認モーダル（一覧・詳細共通）
 */
export function UserUnfreezeModal({
  open,
  onClose,
  user,
  onSuccess,
}: UserUnfreezeModalProps) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await unfreezeUser(user.id);
      await onSuccess();
      onClose();
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
        aria-labelledby="user-unfreeze-modal-title"
        className="relative z-10 mx-4 w-full max-w-[480px] overflow-hidden rounded-xl bg-card shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 id="user-unfreeze-modal-title" className="text-lg font-bold text-text">
            凍結解除の確認
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
          <div className="mb-4 rounded-lg bg-[#f0fdf4] p-3 text-[13px] font-semibold text-[#16a34a]">
            凍結を解除し、通常のアクセスを復元します
          </div>
          <div className="mb-5 rounded-lg bg-bg p-4 text-[13px] leading-relaxed text-textSecondary">
            <div><strong>ユーザー名:</strong> {user?.name ?? '—'}</div>
            <div><strong>メール:</strong> {user?.email ?? '—'}</div>
            <div><strong>凍結日時:</strong> —</div>
          </div>
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
              className="rounded-lg bg-[#16a34a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#16a34a]/90 disabled:opacity-50"
            >
              {loading ? '処理中...' : '凍結解除する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
