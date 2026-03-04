'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  updateOperator,
  deleteOperator,
} from '@/lib/admin-operators-api';
import type { OperatorAdminView } from '@/lib/admin-operators-api';
import { RoleBadge } from './role-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const GLOBAL_ROLE_OPTIONS: { value: 'operator' | 'root_operator'; label: string }[] = [
  { value: 'operator', label: 'Operator' },
  { value: 'root_operator', label: 'Root' },
];

export interface OperatorEditFormProps {
  userId: string;
  operator: OperatorAdminView;
  /** ログイン中ユーザーID。自分自身の削除時に警告表示に使用 */
  currentUserId?: string | null;
}

/**
 * 運営スタッフ編集フォーム（ADMIN-03 / ADM-UI-09）
 *
 * API: API-ADMIN-17（編集）、API-ADMIN-18（削除）
 * 削除時: ConfirmDialog → deleteOperator() → /admin/operators へリダイレクト
 */
export function OperatorEditForm({
  userId,
  operator,
  currentUserId,
}: OperatorEditFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [globalRole, setGlobalRole] = React.useState<'operator' | 'root_operator'>(operator.globalRole);
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isSelf = currentUserId != null && userId === currentUserId;

  React.useEffect(() => {
    setGlobalRole(operator.globalRole);
  }, [operator.globalRole]);

  const handleSave = async () => {
    if (globalRole === operator.globalRole) return;
    setError(null);
    setSaveLoading(true);
    try {
      await updateOperator(userId, { globalRole });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'operators'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    await deleteOperator(userId);
    await queryClient.invalidateQueries({ queryKey: ['admin', 'operators'] });
    router.push('/admin/operators');
  };

  return (
    <div className="space-y-6">
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-textTertiary">ID</dt>
          <dd className="font-mono text-sm text-text">{operator.id}</dd>
        </div>
        <div>
          <dt className="text-sm text-textTertiary">メール</dt>
          <dd className="text-text">{operator.email ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-sm text-textTertiary">名前</dt>
          <dd className="text-text">{operator.name ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-sm text-textTertiary">現在のロール</dt>
          <dd>
            <RoleBadge role={operator.globalRole} />
          </dd>
        </div>
        <div>
          <dt className="text-sm text-textTertiary">作成日</dt>
          <dd className="text-text">
            {operator.createdAt
              ? new Date(operator.createdAt).toLocaleString('ja-JP')
              : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-textTertiary">更新日</dt>
          <dd className="text-text">
            {operator.updatedAt
              ? new Date(operator.updatedAt).toLocaleString('ja-JP')
              : '—'}
          </dd>
        </div>
      </dl>

      <div>
        <h2 className="text-sm font-medium text-textSecondary">ロール変更</h2>
        <div className="mt-2 flex items-center gap-2">
          <select
            value={globalRole}
            onChange={(e) => setGlobalRole(e.target.value as 'operator' | 'root_operator')}
            className="rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {GLOBAL_ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSave}
            disabled={saveLoading || globalRole === operator.globalRole}
            className="rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90 disabled:opacity-50"
          >
            {saveLoading ? '保存中...' : '保存'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-error">{error}</p>}
      </div>

      <div className="border-t border-border pt-6">
        <button
          type="button"
          onClick={() => setDeleteConfirmOpen(true)}
          className="rounded-md bg-error px-4 py-2 text-sm text-white hover:bg-error/90"
        >
          削除
        </button>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="論理削除の確認"
        description={
          isSelf
            ? '自分自身を削除します。ログインできなくなります。よろしいですか？'
            : 'この運営スタッフを論理削除します。よろしいですか？'
        }
        confirmLabel="削除する"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
