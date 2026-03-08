'use client';

import * as React from 'react';
import { updateUser } from '@/lib/admin-users-api';
import type { UserAdminViewUser, UserUpdateRequest } from '@/lib/admin-users-api';

export interface UserEditFormProps {
  userId: string;
  user: UserAdminViewUser;
  onSuccess: (updated: UserAdminViewUser) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  /** モーダル内で使う場合: 保存ボタンを出さず form に id を付与 */
  hideSubmitButton?: boolean;
  formId?: string;
  /** ロールを変更不可でバッジ表示のみにする（詳細画面の編集モーダル用） */
  readOnlyRole?: boolean;
}

const GLOBAL_ROLE_OPTIONS: { value: 'learner' | 'instructor'; label: string }[] = [
  { value: 'learner', label: '受講者' },
  { value: 'instructor', label: '講師' },
];

/**
 * ユーザー編集フォーム（API-ADMIN-11）
 * 受講者詳細・講師詳細で共通利用
 */
export function UserEditForm({
  userId,
  user,
  onSuccess,
  onError,
  disabled = false,
  hideSubmitButton = false,
  formId = 'user-edit-form',
  readOnlyRole = false,
}: UserEditFormProps) {
  const [email, setEmail] = React.useState(user.email ?? '');
  const [name, setName] = React.useState(user.name ?? '');
  const [globalRole, setGlobalRole] = React.useState<'learner' | 'instructor'>(
    user.globalRole === 'learner' || user.globalRole === 'instructor' ? user.globalRole : 'learner'
  );
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setEmail(user.email ?? '');
    setName(user.name ?? '');
    setGlobalRole(
      user.globalRole === 'learner' || user.globalRole === 'instructor' ? user.globalRole : 'learner'
    );
  }, [user.id, user.email, user.name, user.globalRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onError?.('');
    try {
      const body: UserUpdateRequest = {
        email: email.trim() || undefined,
        name: name.trim() || undefined,
        globalRole,
      };
      const updated = await updateUser(userId, body);
      onSuccess(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新に失敗しました';
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="edit-email" className="block text-sm font-medium text-textSecondary">
          メールアドレス
        </label>
        <input
          id="edit-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={disabled}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
        />
      </div>
      <div>
        <label htmlFor="edit-name" className="block text-sm font-medium text-textSecondary">
          表示名
        </label>
        <input
          id="edit-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
        />
      </div>
      <div>
        <label htmlFor="edit-globalRole" className="block text-sm font-medium text-textSecondary">
          ロール
        </label>
        {readOnlyRole ? (
          <p className="mt-1">
            <span className="inline-flex rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
              {globalRole === 'instructor' ? '講師' : '受講者'}
            </span>
          </p>
        ) : (
          <select
            id="edit-globalRole"
            value={globalRole}
            onChange={(e) => setGlobalRole(e.target.value as 'learner' | 'instructor')}
            disabled={disabled}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          >
            {GLOBAL_ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>
      {!hideSubmitButton && (
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading || disabled}
          className="rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90 disabled:opacity-50"
        >
          {loading ? '保存中...' : '保存'}
        </button>
      </div>
      )}
    </form>
  );
}
