'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { inviteOperator } from '@/lib/admin-operators-api';
import type { OperatorInviteRequest } from '@/lib/admin-operators-api';

const GLOBAL_ROLE_OPTIONS: { value: 'operator' | 'root_operator'; label: string }[] = [
  { value: 'operator', label: 'Operator' },
  { value: 'root_operator', label: 'Root' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 運営スタッフ招待フォーム（ADMIN-03 / ADM-UI-08）
 *
 * API: API-ADMIN-16 POST /api/v1/admin/operators
 * 成功時: /admin/operators へリダイレクト
 * 409: メールアドレス重複メッセージ表示
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
    if (!name.trim()) errs.name = '名前を入力してください';
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
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label htmlFor="operator-invite-email" className="block text-sm font-medium text-textSecondary">
          メールアドレス <span className="text-error">*</span>
        </label>
        <input
          id="operator-invite-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-error">{fieldErrors.email}</p>
        )}
      </div>
      <div>
        <label htmlFor="operator-invite-name" className="block text-sm font-medium text-textSecondary">
          名前 <span className="text-error">*</span>
        </label>
        <input
          id="operator-invite-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {fieldErrors.name && (
          <p className="mt-1 text-sm text-error">{fieldErrors.name}</p>
        )}
      </div>
      <div>
        <label htmlFor="operator-invite-role" className="block text-sm font-medium text-textSecondary">
          ロール <span className="text-error">*</span>
        </label>
        <select
          id="operator-invite-role"
          value={globalRole}
          onChange={(e) => setGlobalRole(e.target.value as 'operator' | 'root_operator')}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {GLOBAL_ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => router.push('/admin/operators')}
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
  );
}
