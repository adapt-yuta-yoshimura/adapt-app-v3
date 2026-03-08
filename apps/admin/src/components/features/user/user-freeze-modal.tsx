'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { freezeUser } from '@/lib/admin-users-api';
import type { UserModalUser } from './user-modal-types';

export interface UserFreezeModalProps {
  open: boolean;
  onClose: () => void;
  user: UserModalUser | null;
  onSuccess: () => void | Promise<void>;
}

/**
 * ユーザー凍結確認モーダル（一覧・詳細共通）
 * 凍結理由必須、未入力時は確定ボタン無効
 */
export function UserFreezeModal({
  open,
  onClose,
  user,
  onSuccess,
}: UserFreezeModalProps) {
  const [freezeReason, setFreezeReason] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) setFreezeReason('');
  }, [open]);

  const handleConfirm = async () => {
    if (!user?.id || !freezeReason.trim()) return;
    setLoading(true);
    try {
      await freezeUser(user.id);
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
        aria-labelledby="user-freeze-modal-title"
        className="relative z-10 mx-4 w-full max-w-[480px] overflow-hidden rounded-xl bg-card shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 id="user-freeze-modal-title" className="text-lg font-bold text-text">
            ユーザー凍結の確認
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
          <div className="mb-4 rounded-lg bg-[#eff6ff] p-3 text-[13px] font-semibold text-[#1d4ed8]">
            凍結するとこのユーザーのシステム全体へのアクセスが制限されます
          </div>
          <div className="mb-4 rounded-lg bg-bg p-4 text-[13px] leading-relaxed text-textSecondary">
            <div><strong>ユーザー名:</strong> {user?.name ?? '—'}</div>
            <div><strong>メール:</strong> {user?.email ?? '—'}</div>
            <div><strong>現在のロール:</strong> {user?.globalRole ?? '—'}</div>
          </div>
          <div className="mb-4">
            <label htmlFor="freeze-reason" className="mb-2 block text-[13px] font-semibold text-textSecondary">
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
          <p className="mb-5 rounded-md bg-[#fff7ed] p-3 text-xs text-[#d97706]">
            凍結解除は root_operator のみ可能です
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
              disabled={loading || !freezeReason.trim()}
              className="rounded-lg bg-[#1d4ed8] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#94a3b8]"
            >
              {loading ? '処理中...' : '凍結する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
