'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { inviteOperator } from '@/lib/admin-operators-api';
import type { OperatorInviteRequest } from '@/lib/admin-operators-api';

const GLOBAL_ROLE_OPTIONS: {
  value: 'operator' | 'root_operator';
  label: string;
  description: string;
}[] = [
  {
    value: 'operator',
    label: 'Operator',
    description: '通常の運営権限 (講座管理、ユーザー管理)',
  },
  {
    value: 'root_operator',
    label: 'Root Operator',
    description: 'すべての権限 (DM閲覧、緊急凍結、スタッフ管理)',
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 運営スタッフ招待フォーム（ADMIN-03 / ADM-UI-08）
 *
 * API: API-ADMIN-16 POST /api/v1/admin/operators
 * 成功時: /admin/operators へリダイレクト
 * 409: メールアドレス重複メッセージ表示
 * Figma: メール*・表示名*・付与ロール*（ラジオカード）・招待フロー・キャンセル / 招待メールを送信
 */
export function OperatorInviteForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [globalRole, setGlobalRole] = React.useState<'operator' | 'root_operator'>('operator');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<{ email?: string; name?: string }>({});

  const validate = (): boolean => {
    const errs: { email?: string; name?: string } = {};
    if (!email.trim()) errs.email = 'メールアドレスを入力してください';
    else if (!EMAIL_REGEX.test(email)) errs.email = '有効なメールアドレスを入力してください';
    if (!name.trim()) errs.name = '表示名を入力してください';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    if (!validate()) return;

    setLoading(true);
    try {
      const body: OperatorInviteRequest = { email: email.trim(), name: name.trim(), globalRole };
      await inviteOperator(body);
      router.push('/admin/operators');
    } catch (err) {
      const message = err instanceof Error ? err.message : '招待に失敗しました';
      if (message.includes('409') || message.includes('already exists') || message.includes('重複')) {
        setError('このメールアドレスは既に登録されています');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <label htmlFor="operator-invite-email" className="block text-[13px] font-semibold text-textSecondary">
          メールアドレス <span className="text-error">*</span>
        </label>
        <input
          id="operator-invite-email"
          type="email"
          required
          placeholder="staff@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-[14px] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <p className="text-[12px] text-textTertiary">このアドレスに招待メールが送信されます</p>
        {fieldErrors.email && (
          <p className="text-sm text-error">{fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="operator-invite-name" className="block text-[13px] font-semibold text-textSecondary">
          表示名 <span className="text-error">*</span>
        </label>
        <input
          id="operator-invite-name"
          type="text"
          required
          placeholder="山田 太郎"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-[14px] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {fieldErrors.name && (
          <p className="text-sm text-error">{fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-3">
        <label className="block text-[13px] font-semibold text-textSecondary">
          付与ロール <span className="text-error">*</span>
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {GLOBAL_ROLE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer flex-col gap-1 rounded-lg border-2 px-4 py-3 transition-colors ${
                globalRole === opt.value
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-card hover:border-textTertiary'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="operator-role"
                  value={opt.value}
                  checked={globalRole === opt.value}
                  onChange={() => setGlobalRole(opt.value)}
                  className="h-4 w-4 border-border text-accent focus:ring-accent"
                />
                <span className="text-[14px] font-semibold text-text">{opt.label}</span>
              </div>
              <p className="pl-6 text-[11px] text-textTertiary">{opt.description}</p>
            </label>
          ))}
        </div>
      </div>

      {/* 招待フロー（Figma: 3ステップ） */}
      <div className="flex items-center gap-4 border-t border-border pt-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
            1
          </span>
          <span className="text-[13px] text-textSecondary">招待メール送信</span>
        </div>
        <span className="h-px flex-1 border-b border-dashed border-border" />
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
            2
          </span>
          <span className="text-[13px] text-textSecondary">パスワード設定</span>
        </div>
        <span className="h-px flex-1 border-b border-dashed border-border" />
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
            3
          </span>
          <span className="text-[13px] text-textSecondary">ログイン可能</span>
        </div>
      </div>
      <p className="text-[12px] text-textTertiary">
        入力したアドレスにメール送信 → auth.adapt-co.ioでパスワード設定 → admin.adapt-co.io にログイン
      </p>

      {error && (
        <p className="text-sm text-error">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/admin/operators')}
          className="rounded-lg border border-border bg-card px-5 py-2.5 text-[14px] font-medium text-textSecondary hover:bg-bg"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(59,130,246,0.25)] hover:bg-accent/90 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {loading ? '送信中...' : '招待メールを送信'}
        </button>
      </div>
    </form>
  );
}
