'use client';

import * as React from 'react';
import { X } from 'lucide-react';

/**
 * ConfirmDialog（ADMIN-00 共通コンポーネント）
 * Figma JSX 準拠: 半透明オーバーレイ + 白カード rounded-xl max-w-[480px] p-6
 * タイトル + 右上閉じるX / 警告バナー / 情報ブロック / ボタン右揃え
 */
export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** success=緑(承認等) / danger=赤(削除) / freeze=青(凍結) / unfreeze=緑(凍結解除) / default=accent */
  variant?: 'default' | 'danger' | 'success' | 'freeze' | 'unfreeze';
  onConfirm: () => void | Promise<void>;
  /** 凍結モーダルなどで理由未入力時に確定ボタンを無効化 */
  confirmDisabled?: boolean;
  /** 警告バナー（凍結: 薄青 / 削除: 薄赤） */
  warningBanner?: React.ReactNode;
  /** 情報表示エリア（bg-bg rounded-lg p-4） */
  infoBlock?: React.ReactNode;
  /** 説明とボタンの間に表示する任意の内容（例: 凍結理由テキストエリア） */
  children?: React.ReactNode;
}

const VARIANT_BUTTON_CLASS: Record<
  NonNullable<ConfirmDialogProps['variant']>,
  string
> = {
  default: 'bg-accent text-white hover:bg-accent/90',
  danger: 'bg-error text-white hover:bg-error/90',
  success: 'bg-success text-white hover:bg-success/90',
  freeze: 'bg-[#1d4ed8] text-white hover:bg-[#1d4ed8]/90',
  unfreeze: 'bg-success text-white hover:bg-success/90',
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = '実行',
  cancelLabel = 'キャンセル',
  variant = 'default',
  onConfirm,
  confirmDisabled = false,
  warningBanner,
  infoBlock,
  children,
}: ConfirmDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    if (confirmDisabled) return;
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
        aria-labelledby="confirm-dialog-title"
        className="relative z-10 w-full max-w-[480px] overflow-hidden rounded-xl bg-card shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2
            id="confirm-dialog-title"
            className="text-lg font-bold text-text"
          >
            {title}
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

        <div className="px-6 py-5">
          {warningBanner && (
            <div className="mb-4">
              {warningBanner}
            </div>
          )}
          {infoBlock && (
            <div className="mb-4 rounded-lg bg-bg p-4 text-[13px] leading-relaxed text-textSecondary">
              {infoBlock}
            </div>
          )}
          {description && (
            <p className="mb-4 text-sm text-textSecondary">{description}</p>
          )}
          {children && <div className="mb-5">{children}</div>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-border bg-card px-6 py-2.5 text-sm font-medium text-textSecondary hover:bg-bg"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading || confirmDisabled}
              className={`rounded-lg px-6 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_BUTTON_CLASS[variant]}`}
            >
              {loading ? '処理中...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
