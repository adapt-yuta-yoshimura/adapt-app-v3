import { WebLayout } from '@/components/layout/WebLayout';

/**
 * 認証済みページ用レイアウト（WebLayout: Header + Sidebar + Content）
 */
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WebLayout>{children}</WebLayout>;
}
