'use client';

import * as React from 'react';

/**
 * ConfirmDialog（ADMIN-00 共通コンポーネント）
 * shadcn/ui Dialog ベースの確認ダイアログの枠
 */
export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = '実行',
  cancelLabel = 'キャンセル',
  variant = 'default',
  onConfirm,
}: ConfirmDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="confirm-title"
        className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg"
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-text">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-textSecondary">{description}</p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-bg"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`rounded-md px-4 py-2 text-sm text-white disabled:opacity-50 ${
              variant === 'danger' ? 'bg-error hover:bg-error/90' : 'bg-accent hover:bg-accent/90'
            }`}
          >
            {loading ? '処理中...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
