'use client';

import * as React from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => { reset(); onOpenChange(false); }}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="invite-title"
        className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg"
      >
        <h2 id="invite-title" className="text-lg font-semibold text-text">
          {label}を招待
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="invite-email" className="block text-sm font-medium text-textSecondary">
              メールアドレス
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label htmlFor="invite-name" className="block text-sm font-medium text-textSecondary">
              表示名
            </label>
            <input
              id="invite-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          {error && (
            <p className="text-sm text-error">{error}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => { reset(); onOpenChange(false); }}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-bg"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90 disabled:opacity-50"
            >
              {loading ? '送信中...' : '招待する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
