'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchOperatorList } from '@/lib/admin-operators-api';
import { OperatorEditForm } from '@/components/features/operator/operator-edit-form';

/**
 * ADM-UI-09: 運営スタッフ編集
 *
 * - Path: /admin/operators/[userId]
 * - API: API-ADMIN-15（一覧から取得）、API-ADMIN-17（編集）、API-ADMIN-18（削除）
 * - ロール: root_operator のみ
 */
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
        <Link href="/admin/operators" className="mt-4 inline-block text-accent hover:underline">
          ← 一覧へ
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">運営スタッフ編集</h1>
        <Link
          href="/admin/operators"
          className="text-sm text-accent hover:underline"
        >
          ← 一覧へ
        </Link>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <OperatorEditForm
          userId={userId}
          operator={operator}
          currentUserId={undefined}
        />
      </div>
    </div>
  );
}
