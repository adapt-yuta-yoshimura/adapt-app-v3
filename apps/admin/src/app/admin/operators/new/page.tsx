'use client';

import Link from 'next/link';
import { OperatorInviteForm } from '@/components/features/operator/operator-invite-form';

/**
 * ADM-UI-08: 運営スタッフ招待
 *
 * - Path: /admin/operators/new
 * - API: API-ADMIN-16 POST /api/v1/admin/operators
 * - ロール: root_operator のみ
 */
export default function NewOperatorPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">運営スタッフ招待</h1>
        <Link
          href="/admin/operators"
          className="text-sm text-accent hover:underline"
        >
          ← 一覧へ
        </Link>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <OperatorInviteForm />
      </div>
    </div>
  );
}
