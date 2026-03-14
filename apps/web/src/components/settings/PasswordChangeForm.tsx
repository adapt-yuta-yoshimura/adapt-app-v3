'use client';

import { useState } from 'react';
import { changePassword, UserApiError } from '@/lib/user-api';
import type { ChangePasswordRequest } from '@/lib/user-api';

type Props = {
  token: string | null;
};

export function PasswordChangeForm({ token }: Props) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '新しいパスワードと確認用が一致しません。' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: '新しいパスワードは8文字以上で入力してください。' });
      return;
    }
    setSubmitting(true);
    try {
      const body: ChangePasswordRequest = {
        currentPassword,
        newPassword,
        confirmPassword,
      };
      await changePassword(token, body);
      setMessage({ type: 'success', text: 'パスワードを変更しました。' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      if (e instanceof UserApiError) {
        setMessage({ type: 'error', text: e.statusCode === 400 ? '現在のパスワードが正しくありません。' : '変更に失敗しました。' });
      } else {
        setMessage({ type: 'error', text: '変更に失敗しました。' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-8 rounded-lg border border-iris-60 bg-white p-6">
      <h2 className="text-lg font-semibold text-black">パスワード変更</h2>
      <p className="mt-1 text-sm text-grey3">パスワードを変更する場合は以下を入力してください。</p>
      <form onSubmit={handleSubmit} className="mt-4 max-w-md space-y-4">
        <div>
          <label htmlFor="current-password" className="block text-sm font-medium text-black">
            現在のパスワード
          </label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="mt-1 w-full rounded border border-iris-60 px-3 py-2 text-sm"
            autoComplete="current-password"
          />
        </div>
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-black">
            新しいパスワード
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="mt-1 w-full rounded border border-iris-60 px-3 py-2 text-sm"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-black">
            新しいパスワード（確認）
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1 w-full rounded border border-iris-60 px-3 py-2 text-sm"
            autoComplete="new-password"
          />
        </div>
        {message && (
          <p
            role="alert"
            className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
          >
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-iris-100 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? '変更中...' : 'パスワードを変更'}
        </button>
      </form>
    </section>
  );
}
