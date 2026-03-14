// STU-UI-13 支払い設定（共通）
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerToken } from '@/lib/server-auth';
import { fetchProfile } from '@/lib/user-api';
import { CreditCard, ArrowRight } from 'lucide-react';

export default async function BillingSettingsPage() {
  const token = await getServerToken();
  if (!token) {
    redirect('/login?from=/settings/billing');
  }

  let globalRole: 'guest' | 'learner' | 'instructor' | 'operator' | 'root_operator' = 'learner';
  try {
    const profile = await fetchProfile(token);
    globalRole = profile.globalRole ?? 'learner';
  } catch {
    globalRole = 'learner';
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-black">支払い設定</h1>
      <p className="mt-1 text-sm text-grey3">STU-UI-13</p>

      {/* 支払い（受講）: 全ユーザー表示 */}
      <section className="mt-6 rounded-lg border border-iris-60 bg-white p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-black">
          <CreditCard className="h-5 w-5" />
          お支払い方法
        </h2>
        <p className="mt-3 text-sm text-grey3">
          現在、お支払い方法は講座購入時に入力いただいています。
        </p>
        <p className="mt-1 text-sm text-grey3">
          支払い方法の保存・管理機能は準備中です。
        </p>
      </section>

      {/* 受取（講師）: instructor のみ表示 → INS-UI-15 収益管理へ */}
      {globalRole === 'instructor' && (
        <section className="mt-8 rounded-lg border border-iris-60 bg-white p-6">
          <h2 className="text-lg font-semibold text-black">受取設定</h2>
          <p className="mt-2 text-sm text-grey3">
            講師としての収益管理は収益管理画面から行えます。
          </p>
          <Link
            href="/instructor/analytics"
            className="mt-4 inline-flex items-center gap-2 rounded bg-iris-100 px-4 py-2 text-sm font-medium text-white"
          >
            収益管理へ
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}
    </div>
  );
}
