'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchUserList,
  deleteUser,
  freezeUser,
  unfreezeUser,
} from '@/lib/admin-users-api';
import type { UserAdminView, UserAdminViewUser } from '@/lib/admin-users-api';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { UserEditForm } from '@/components/features/user/user-edit-form';

const STORAGE_KEY = 'admin_selected_learner';

export default function LearnerDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = React.use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userFromStorage, setUserFromStorage] = React.useState<UserAdminView | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<
    'delete' | 'freeze' | 'unfreeze' | null
  >(null);
  const [editedUser, setEditedUser] = React.useState<UserAdminView | null>(null);
  const [editError, setEditError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as UserAdminView;
        if (parsed.user.id === userId) setUserFromStorage(parsed);
      } catch {
        // ignore
      }
    }
  }, [userId]);

  const { data: listData } = useQuery({
    queryKey: ['admin', 'users', 'learner', { page: 1, perPage: 100 }],
    queryFn: () => fetchUserList({ globalRole: 'learner', perPage: 100 }),
    enabled: !!userId && !userFromStorage,
  });

  const detailUser = userFromStorage ?? listData?.items.find((i) => i.user.id === userId) ?? null;
  const displayUser = editedUser ?? detailUser;

  const handleDelete = async () => {
    if (!userId) return;
    await deleteUser(userId);
    await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    router.push('/admin/learners');
  };

  const handleFreeze = async () => {
    if (!userId) return;
    await freezeUser(userId);
    await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    setConfirmAction(null);
    setUserFromStorage(null);
  };

  const handleUnfreeze = async () => {
    if (!userId) return;
    await unfreezeUser(userId);
    await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    setConfirmAction(null);
    setUserFromStorage(null);
  };

  if (!userId) {
    return (
      <div className="text-textSecondary">読み込み中...</div>
    );
  }

  if (!detailUser) {
    return (
      <div>
        <p className="text-textSecondary">
          ユーザー情報を表示するには、受講者一覧から該当ユーザーを選択してください。
        </p>
        <Link href="/admin/learners" className="mt-4 inline-block text-accent hover:underline">
          ← 受講者一覧へ
        </Link>
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div>
        <p className="text-textSecondary">
          ユーザー情報を表示するには、受講者一覧から該当ユーザーを選択してください。
        </p>
        <Link href="/admin/learners" className="mt-4 inline-block text-accent hover:underline">
          ← 受講者一覧へ
        </Link>
      </div>
    );
  }

  const u = displayUser.user;

  const handleEditSuccess = (updated: UserAdminViewUser) => {
    const status = updated.deletedAt ? 'deleted' : !updated.isActive ? 'frozen' : 'active';
    setEditedUser({
      user: updated,
      status,
      lastLoginAt: detailUser?.lastLoginAt ?? null,
    });
    void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    setEditError(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">受講者詳細</h1>
        <Link
          href="/admin/learners"
          className="text-sm text-accent hover:underline"
        >
          ← 一覧へ
        </Link>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-textTertiary">ID</dt>
            <dd className="font-mono text-sm text-text">{u.id}</dd>
          </div>
          <div>
            <dt className="text-sm text-textTertiary">メール</dt>
            <dd className="text-text">{u.email ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-sm text-textTertiary">名前</dt>
            <dd className="text-text">{u.name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-sm text-textTertiary">ステータス</dt>
            <dd>
              <StatusBadge variant={displayUser.status}>
                {displayUser.status === 'active' ? 'アクティブ' : displayUser.status === 'frozen' ? '凍結' : '削除済み'}
              </StatusBadge>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-textTertiary">最終ログイン</dt>
            <dd className="text-text">
              {displayUser.lastLoginAt
                ? new Date(displayUser.lastLoginAt).toLocaleString('ja-JP')
                : '—'}
            </dd>
          </div>
        </dl>
        {displayUser.status !== 'deleted' && (
          <>
            <h2 className="mt-6 text-sm font-medium text-textSecondary">編集</h2>
            {editError && <p className="mt-2 text-sm text-error">{editError}</p>}
            <div className="mt-2">
              <UserEditForm
                userId={userId}
                user={u}
                onSuccess={handleEditSuccess}
                onError={setEditError}
              />
            </div>
          </>
        )}
        <div className="mt-6 flex gap-2">
          {displayUser.status === 'frozen' ? (
            <button
              type="button"
              onClick={() => setConfirmAction('unfreeze')}
              className="rounded-md bg-success/90 px-4 py-2 text-sm text-white hover:bg-success"
            >
              凍結解除
            </button>
          ) : displayUser.status === 'active' ? (
            <button
              type="button"
              onClick={() => setConfirmAction('freeze')}
              className="rounded-md bg-warning px-4 py-2 text-sm text-white hover:bg-warning/90"
            >
              凍結
            </button>
          ) : null}
          {displayUser.status !== 'deleted' && (
            <button
              type="button"
              onClick={() => setConfirmAction('delete')}
              className="rounded-md bg-error px-4 py-2 text-sm text-white hover:bg-error/90"
            >
              論理削除
            </button>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={confirmAction === 'delete'}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="論理削除の確認"
        description="この受講者を論理削除します。よろしいですか？"
        confirmLabel="削除する"
        variant="danger"
        onConfirm={handleDelete}
      />
      <ConfirmDialog
        open={confirmAction === 'freeze'}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="凍結の確認"
        description="この受講者を凍結します。よろしいですか？"
        onConfirm={handleFreeze}
      />
      <ConfirmDialog
        open={confirmAction === 'unfreeze'}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="凍結解除の確認"
        description="この受講者の凍結を解除します。よろしいですか？"
        onConfirm={handleUnfreeze}
      />
    </div>
  );
}
