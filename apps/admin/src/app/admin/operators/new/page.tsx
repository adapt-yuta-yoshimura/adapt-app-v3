'use client';

import Link from 'next/link';
import { ArrowLeft, Info, Send } from 'lucide-react';
import { OperatorInviteForm } from '@/components/features/operator/operator-invite-form';

/**
 * ADM-UI-08: 運営スタッフ招待
 *
 * - Path: /admin/operators/new
 * - API: API-ADMIN-16 POST /api/v1/admin/operators
 * - ロール: root_operator のみ
 * - Figma: パンくず・タイトル・説明・情報バナー・フォームカード・招待フロー・アクションボタン
 */
export default function NewOperatorPage() {
  return (
    <div className="flex max-w-[640px] flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
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
              運営スタッフ招待
            </h1>
            <p className="mt-0.5 text-[13px] text-textTertiary">
              メールアドレスで新しい運営スタッフを招待します
            </p>
          </div>
        </div>
      </div>

      {/* 情報バナー（Figma: 淡い青背景・i アイコン） */}
      <div className="flex gap-3 rounded-[10px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-4">
        <Info className="h-5 w-5 shrink-0 text-accent" />
        <p className="text-[13px] leading-relaxed text-textSecondary">
          招待されたユーザーには、パスワード設定リンク付きのメールが送信されます。auth.adapt-co.io
          でアカウント作成・パスワード設定後、ログイン可能になります。
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-7">
        <OperatorInviteForm />
      </div>
    </div>
  );
}
