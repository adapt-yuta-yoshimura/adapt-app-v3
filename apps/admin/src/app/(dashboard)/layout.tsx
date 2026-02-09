import { AdminTitleProvider } from '@/contexts/admin-title-context';
import { AdminHeader } from '@/components/layouts/admin-header';
import { AdminSidebar } from '@/components/layouts/admin-sidebar';

/**
 * AdminLayout: Sidebar (240px fixed) + Header (64px) + Main (scrollable)
 * §3.1: /login はこの layout の外（(auth)）のため Sidebar/Header なし
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <AdminTitleProvider>
      <div className="min-h-screen">
        <AdminSidebar />
        <div className="flex min-h-screen flex-col pl-sidebar">
          <AdminHeader />
          <main className="flex-1 overflow-auto bg-surface-page p-6">{children}</main>
        </div>
      </div>
    </AdminTitleProvider>
  );
}
