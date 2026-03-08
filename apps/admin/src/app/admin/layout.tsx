import { cookies } from 'next/headers';
import { AdminSidebar } from '@/components/layouts/admin-sidebar';
import { AdminHeader } from '@/components/layouts/admin-header';

type GlobalRole = 'operator' | 'root_operator';

/**
 * AdminLayout（共通レイアウト）
 *
 * ADMIN-00チケット準拠:
 * - サイドバー: 幅240px、背景 #0F172A（ダークネイビー）、固定配置
 * - ヘッダー: 高さ56px、白背景、パンくず + アバター
 * - コンテンツ: padding 24px、背景 #F8FAFC
 *
 * サイドバーナビゲーション項目（SoT 07_画面一覧 admin ドメイン準拠）:
 * - ダッシュボード → /admin/dashboard
 * - 受講者管理 → /admin/learners
 * - 講師管理 → /admin/instructors
 * - 運営スタッフ → /admin/operators（root_operator のみ表示）
 * - 講座管理 → /admin/courses
 * - 売上・決済 → /admin/finance/overview
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const globalRole = (cookieStore.get('admin_role')?.value ?? 'operator') as GlobalRole;
  const userName = cookieStore.get('admin_user_name')?.value ?? null;

  return (
    <div className="min-h-screen bg-bg">
      <AdminSidebar
        globalRole={globalRole}
        userName={userName}
        roleLabel={globalRole === 'root_operator' ? 'Root Operator' : 'Operator'}
      />
      <div className="pl-[240px]">
        <AdminHeader userName={userName} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
