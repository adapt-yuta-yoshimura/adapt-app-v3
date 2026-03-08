'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import type { UserAdminViewUser } from '@/lib/admin-users-api';
import { UserEditForm } from './user-edit-form';

export interface UserEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  user: UserAdminViewUser;
  onSuccess: (updated: UserAdminViewUser) => void;
  onError?: (message: string) => void;
  /** 親で保持しているエラーメッセージ（編集失敗時に表示） */
  error?: string | null;
}

const FORM_ID = 'user-edit-modal-form';

/**
 * ユーザー情報編集モーダル（ADM-UI-04 / ADM-UI-06）
 * ConfirmDialog と同じデザイン: オーバーレイ + 白カード max-w-[520px] + ヘッダー（タイトル+閉じるX）+ フォーム + フッター（キャンセル + 保存する）
 */
export function UserEditModal({
  open,
  onOpenChange,
  userId,
  user,
  onSuccess,
  onError,
  error,
}: UserEditModalProps) {
  const handleSuccess = (updated: UserAdminViewUser) => {
    onSuccess(updated);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div
        className="fixed inset-0"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="user-edit-modal-title"
        className="relative z-10 mx-4 w-full max-w-[520px] overflow-hidden rounded-xl bg-card shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
      >
        <div className="flex items-center justify-between border-b border-border px-6 pt-6 pb-4">
          <h2
            id="user-edit-modal-title"
            className="text-lg font-bold text-text"
          >
            ユーザー情報の編集
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-transparent text-textMuted hover:bg-bg hover:text-text"
            aria-label="閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-4">
          {error && (
            <p className="mb-4 text-sm text-error">{error}</p>
          )}
          <UserEditForm
            userId={userId}
            user={user}
            onSuccess={handleSuccess}
            onError={onError}
            hideSubmitButton
            formId={FORM_ID}
            readOnlyRole
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-6 pb-6 pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-border bg-card px-6 py-2.5 text-sm font-medium text-textSecondary hover:bg-bg"
          >
            キャンセル
          </button>
          <button
            type="submit"
            form={FORM_ID}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
          >
            保存する
          </button>
        </div>
      </div>
    </div>
  );
}
