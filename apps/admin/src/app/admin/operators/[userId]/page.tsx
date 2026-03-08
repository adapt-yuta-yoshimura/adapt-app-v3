'use client';

/**
 * ADM-UI-09: 運営スタッフ編集
 *
 * Figma nodeId: 8347:15
 * レイアウト: パンくず → 戻る+タイトル+説明 → カード1（アバター+名前+メール+Active / 2x2グリッド）→ カード2（ロール変更・Operator/Root Operatorラジオ+保存）→ カード3（危険な操作+削除）
 *
 * API: API-ADMIN-15（一覧）、API-ADMIN-17（編集）、API-ADMIN-18（削除）
 * ロール: root_operator のみ
 */

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchOperatorList } from '@/lib/admin-operators-api';
import type { OperatorAdminView } from '@/lib/admin-operators-api';
import { OperatorEditForm } from '@/components/features/operator/operator-edit-form';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}/${m}/${day}`;
}

export default function OperatorDetailPage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId as string | undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'operators', { page: 1, perPage: 100 }],
    queryFn: () => fetchOperatorList({ page: 1, perPage: 100 }),
    enabled: !!userId,
  });

  const operator = data?.items.find((i) => i.id === userId) ?? null;

  if (!userId) {
    return (
      <div className="text-textSecondary">読み込み中...</div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-textSecondary">読み込み中...</div>
    );
  }

  if (!operator) {
    return (
      <div>
        <p className="text-textSecondary">指定されたスタッフが見つかりません。</p>
        <Link
          href="/admin/operators"
          className="mt-4 inline-block text-accent hover:underline"
        >
          ← 一覧へ
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* パンくず（Figma: 管理画面 / 運営スタッフ / 名前） */}
      <nav className="flex items-center gap-1.5 text-[13px] text-textMuted">
        <Link href="/admin/dashboard" className="hover:text-textSecondary">
          ホーム
        </Link>
        <span>/</span>
        <Link href="/admin/operators" className="hover:text-textSecondary">
          運営スタッフ
        </Link>
        <span>/</span>
        <span className="font-medium text-text">{operator.name ?? operator.id}</span>
      </nav>

      {/* 戻る + タイトル + 説明 */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/operators"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-textTertiary transition-colors hover:bg-bg hover:text-text"
          aria-label="一覧に戻る"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </Link>
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-text">
            運営スタッフ編集
          </h1>
          <p className="mt-0.5 text-[13px] text-textTertiary">
            ロールの変更・スタッフの削除
          </p>
        </div>
      </div>

      {/* カード1: スタッフ情報（アバター+名前+メール+Active / 2x2 ユーザーID・登録日・名前・メール） */}
      <div className="max-w-[640px] rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-border text-lg font-bold text-textSecondary">
            {(operator.name ?? operator.email ?? operator.id).slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-text">
              {operator.name ?? '—'}
            </h2>
            <p className="mt-0.5 text-[13px] text-textTertiary">
              {operator.email ?? '—'}
            </p>
          </div>
          {operator.isActive && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 py-1 pl-3 pr-2 text-xs font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Active
            </span>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              ユーザーID
            </p>
            <p className="mt-1 text-sm text-text">{operator.id}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              登録日
            </p>
            <p className="mt-1 text-sm text-text">
              {formatDate(operator.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              名前
            </p>
            <p className="mt-1 text-sm text-text">{operator.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              メール
            </p>
            <p className="mt-1 text-sm text-text">{operator.email ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* カード2: ロール変更 + カード3: 危険な操作（既存フォームをカード内に表示） */}
      <div className="max-w-[640px]">
        <OperatorEditForm
          userId={userId}
          operator={operator}
          currentUserId={undefined}
          layout="cards"
        />
      </div>
    </div>
  );
}
