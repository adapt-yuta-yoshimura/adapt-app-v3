import { WebHeader } from '@/components/layout/WebHeader';

/**
 * 公開ページ用レイアウト（Header のみ、サイドバーなし）
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-body">
      <WebHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
