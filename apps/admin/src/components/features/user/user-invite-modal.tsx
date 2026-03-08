'use client';

import * as React from 'react';
import { Mail, Send, X } from 'lucide-react';
import type { UserInviteRequest } from '@/lib/admin-users-api';

export interface UserInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  globalRole: 'learner' | 'instructor';
  onSubmit: (body: UserInviteRequest) => Promise<void>;
}

const ROLE_LABEL: Record<'learner' | 'instructor', string> = {
  learner: '受講者',
  instructor: '講師',
};

/**
 * 招待モーダル（Figma JSX 準拠）
 * batch3: オーバーレイ + 白カード max-w-[520px] rounded-xl p-8
 * ヘッダー（アイコン+タイトル+説明）+ フォーム + 招待フロー + ボタン右揃え
 */
export function UserInviteModal({
  open,
  onOpenChange,
  globalRole,
  onSubmit,
}: UserInviteModalProps) {
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const reset = () => {
    setEmail('');
    setName('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ email, name, globalRole });
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '招待に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const label = ROLE_LABEL[globalRole];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div
        className="fixed inset-0"
        onClick={() => {
          reset();
          onOpenChange(false);
        }}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="invite-modal-title"
        className="relative z-10 w-full max-w-[520px] overflow-hidden rounded-xl bg-card p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="invite-modal-title"
                className="text-lg font-bold text-text"
              >
                {label}を招待
              </h2>
              <p className="mt-0.5 text-xs text-textTertiary">
                メールアドレスで招待を送信します
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-textMuted hover:bg-bg hover:text-text"
            aria-label="閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="invite-email"
              className="mb-1.5 block text-xs font-semibold text-textSecondary"
            >
              メールアドレス <span className="text-error">*</span>
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="instructor@example.com"
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-[13px] text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label
              htmlFor="invite-name"
              className="mb-1.5 block text-xs font-semibold text-textSecondary"
            >
              表示名 <span className="text-error">*</span>
            </label>
            <input
              id="invite-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="山田 太郎"
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-[13px] text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-textSecondary">
              ロール
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3.5 py-2.5">
              <span className="inline-flex rounded px-2 py-0.5 text-[11px] font-semibold bg-accent/10 text-accent">
                {globalRole}
              </span>
              <span className="text-xs text-textTertiary">
                {globalRole === 'instructor'
                  ? '講師ロールが自動設定されます'
                  : '受講者ロールが自動設定されます'}
              </span>
            </div>
          </div>

          <div className="mt-2 rounded-xl border border-accent/20 bg-accent/5 p-4">
            <div className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-accent">
              招待フロー
            </div>
            <div className="flex items-center gap-0">
              {[
                { step: '1', label: '招待メール送信', sub: 'adapt → 講師' },
                { step: '2', label: 'パスワード設定', sub: 'auth.adapt-co.io' },
                { step: '3', label: 'プロフィール設定', sub: '初回ログイン時' },
              ].map((s, i) => (
                <div
                  key={s.step}
                  className="flex flex-1 flex-col items-center text-center"
                >
                  <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                    {s.step}
                  </div>
                  <div className="text-[11px] font-semibold text-text">
                    {s.label}
                  </div>
                  <div className="text-[10px] text-textTertiary">{s.sub}</div>
                  {i < 2 && (
                    <div className="mt-2 h-px w-8 shrink-0 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-error">{error}</p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="rounded-lg border border-border bg-card px-5 py-2.5 text-[13px] font-medium text-textSecondary hover:bg-bg"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border-0 bg-accent px-6 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-accent/30 hover:bg-accent/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {loading ? '送信中...' : '招待メールを送信'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
