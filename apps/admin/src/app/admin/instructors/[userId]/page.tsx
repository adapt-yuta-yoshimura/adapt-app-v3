'use client';

/**
 * ADM-UI-06: 講師詳細
 *
 * Figma nodeId: 8349:4
 * レイアウト: パンくず → 戻る → 講師サマリーカード（アバター+名前+ステータス+メール+ID / 編集・凍結・削除 / 4項目グリッド）→ タブ（開講講座 | 収益サマリー）→ テーブル
 */

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil, Snowflake, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchUserList,
} from '@/lib/admin-users-api';
import type { UserAdminView, UserAdminViewUser } from '@/lib/admin-users-api';
import { UserEditModal } from '@/components/features/user/user-edit-modal';
import { UserFreezeModal } from '@/components/features/user/user-freeze-modal';
import { UserUnfreezeModal } from '@/components/features/user/user-unfreeze-modal';
import { UserDeleteModal } from '@/components/features/user/user-delete-modal';

const STORAGE_KEY = 'admin_selected_instructor';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}

export default function InstructorDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = React.use(params);
  const queryClient = useQueryClient();
  const [userFromStorage, setUserFromStorage] =
    React.useState<UserAdminView | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<
    'delete' | 'freeze' | 'unfreeze' | null
  >(null);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editedUser, setEditedUser] = React.useState<UserAdminView | null>(null);
  const [editError, setEditError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'courses' | 'revenue'>(
    'courses',
  );

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
    queryKey: ['admin', 'users', 'instructor', { page: 1, perPage: 100 }],
    queryFn: () => fetchUserList({ globalRole: 'instructor', perPage: 100 }),
    enabled: !!userId && !userFromStorage,
  });

  const detailUser =
    userFromStorage ??
    listData?.items.find((i) => i.user.id === userId) ??
    null;
  const displayUser = editedUser ?? detailUser;

  const handleDetailModalSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
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
          ユーザー情報を表示するには、講師一覧から該当ユーザーを選択してください。
        </p>
        <Link
          href="/admin/instructors"
          className="mt-4 inline-block text-accent hover:underline"
        >
          ← 講師一覧へ
        </Link>
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div>
        <p className="text-textSecondary">
          ユーザー情報を表示するには、講師一覧から該当ユーザーを選択してください。
        </p>
        <Link
          href="/admin/instructors"
          className="mt-4 inline-block text-accent hover:underline"
        >
          ← 講師一覧へ
        </Link>
      </div>
    );
  }

  const u = displayUser.user;
  const statusLabel =
    displayUser.status === 'active'
      ? 'Active'
      : displayUser.status === 'frozen'
        ? '凍結'
        : '削除済み';

  const handleEditSuccess = (updated: UserAdminViewUser) => {
    const status = updated.deletedAt
      ? 'deleted'
      : !updated.isActive
        ? 'frozen'
        : 'active';
    setEditedUser({
      user: updated,
      status,
      lastLoginAt: detailUser?.lastLoginAt ?? null,
    });
    void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    setEditError(null);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* パンくず */}
      <nav className="flex items-center gap-1.5 text-[13px] text-textMuted">
        <Link href="/admin/dashboard" className="hover:text-textSecondary">
          ホーム
        </Link>
        <span>/</span>
        <Link href="/admin/instructors" className="hover:text-textSecondary">
          講師管理
        </Link>
        <span>/</span>
        <span className="font-bold text-text">{u.name ?? u.id}</span>
      </nav>

      {/* 戻るリンク */}
      <Link
        href="/admin/instructors"
        className="inline-flex items-center gap-2 text-[13px] text-textTertiary hover:text-textSecondary"
      >
        <ArrowLeft className="h-[18px] w-[18px]" />
        講師管理一覧に戻る
      </Link>

      {/* 講師サマリーカード（Figma: アバター+名前+ステータス / 編集・凍結・削除 / 4項目グリッド） */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-success/10 text-2xl font-bold text-success">
              {(u.name ?? u.email ?? u.id).slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-text">{u.name ?? '—'}</h1>
                {displayUser.status === 'active' && (
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-success">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    {statusLabel}
                  </span>
                )}
                {displayUser.status === 'frozen' && (
                  <span className="text-[13px] text-warning">{statusLabel}</span>
                )}
                {displayUser.status === 'deleted' && (
                  <span className="text-[13px] text-textMuted">{statusLabel}</span>
                )}
              </div>
              <p className="mt-1 text-[13px] text-textTertiary">
                {u.email ?? '—'}
              </p>
              <p className="mt-1 text-xs text-textMuted">ID: {u.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {displayUser.status !== 'deleted' && (
              <>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-[13px] font-medium text-textSecondary hover:bg-bg"
                  onClick={() => setShowEditModal(true)}
                  aria-label="編集"
                >
                  <Pencil className="h-4 w-4" />
                  編集
                </button>
                {displayUser.status === 'frozen' ? (
                  <button
                    type="button"
                    onClick={() => setConfirmAction('unfreeze')}
                    className="inline-flex items-center gap-2 rounded-lg bg-success/90 px-4 py-2 text-[13px] font-medium text-white hover:bg-success"
                  >
                    <Snowflake className="h-4 w-4" />
                    凍結解除
                  </button>
                ) : displayUser.status === 'active' ? (
                  <button
                    type="button"
                    onClick={() => setConfirmAction('freeze')}
                    className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-[#fffbeb] px-4 py-2 text-[13px] font-medium text-warning hover:bg-amber-50"
                  >
                    <Snowflake className="h-4 w-4" />
                    凍結
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setConfirmAction('delete')}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#fecaca] bg-error/10 px-4 py-2 text-[13px] font-medium text-error hover:bg-error/20"
                >
                  <Trash2 className="h-4 w-4" />
                  削除
                </button>
              </>
            )}
          </div>
        </div>

        {/* 4項目グリッド（ユーザーID / ロール / 登録日 / 開講講座数） */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 lg:grid-cols-4">
          <div className="rounded-lg bg-bg px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-textTertiary">
              ユーザーID
            </p>
            <p className="mt-1 text-sm font-bold text-text">{u.id}</p>
          </div>
          <div className="rounded-lg bg-bg px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-textTertiary">
              ロール
            </p>
            <p className="mt-1 text-sm font-bold text-text">
              {u.globalRole ?? 'instructor'}
            </p>
          </div>
          <div className="rounded-lg bg-bg px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-textTertiary">
              登録日
            </p>
            <p className="mt-1 text-sm font-bold text-text">
              {formatDate(u.createdAt)}
            </p>
          </div>
          <div className="rounded-lg bg-bg px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-textTertiary">
              開講講座数
            </p>
            <p className="mt-1 text-sm font-bold text-text">
              —（API未実装）
            </p>
          </div>
        </div>
      </div>

      {/* タブ: 開講講座 | 収益サマリー */}
      <div className="border-b-2 border-border">
        <div className="flex gap-0">
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`border-b-2 px-6 py-3 text-[13px] font-medium transition-colors ${
              activeTab === 'courses'
                ? 'border-accent text-accent'
                : 'border-transparent text-textTertiary hover:text-textSecondary'
            }`}
          >
            開講講座
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('revenue')}
            className={`-mb-0.5 border-b-2 px-6 py-3 text-[13px] font-medium transition-colors ${
              activeTab === 'revenue'
                ? 'border-accent text-accent'
                : 'border-transparent text-textTertiary hover:text-textSecondary'
            }`}
          >
            収益サマリー
          </button>
        </div>
      </div>

      {/* タブコンテンツ: 開講講座（テーブル） */}
      {activeTab === 'courses' && (
        <div className="overflow-hidden rounded-b-xl border border-t-0 border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-bg">
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-textTertiary">
                  講座タイトル
                </th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-textTertiary">
                  ステータス
                </th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-textTertiary">
                  スタイル
                </th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-textTertiary">
                  受講者数
                </th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-textTertiary">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-textMuted"
                >
                  開講講座データは API 未実装のため表示できません
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* タブコンテンツ: 収益サマリー */}
      {activeTab === 'revenue' && (
        <div className="rounded-b-xl border border-t-0 border-border bg-card p-8">
          <p className="text-center text-textMuted">
            収益サマリーは API 未実装のため表示できません
          </p>
        </div>
      )}

      <UserEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        userId={userId}
        user={u}
        onSuccess={handleEditSuccess}
        onError={setEditError}
        error={editError}
      />

      {confirmAction === 'freeze' && (
        <UserFreezeModal
          open
          onClose={() => setConfirmAction(null)}
          user={{ id: u.id, name: u.name, email: u.email, globalRole: u.globalRole }}
          onSuccess={handleDetailModalSuccess}
        />
      )}
      {confirmAction === 'unfreeze' && (
        <UserUnfreezeModal
          open
          onClose={() => setConfirmAction(null)}
          user={{ id: u.id, name: u.name, email: u.email }}
          onSuccess={handleDetailModalSuccess}
        />
      )}
      {confirmAction === 'delete' && (
        <UserDeleteModal
          open
          onClose={() => setConfirmAction(null)}
          user={{ id: u.id, name: u.name, email: u.email, globalRole: u.globalRole }}
          onSuccess={handleDetailModalSuccess}
          redirectTo="/admin/instructors"
        />
      )}
    </div>
  );
}
