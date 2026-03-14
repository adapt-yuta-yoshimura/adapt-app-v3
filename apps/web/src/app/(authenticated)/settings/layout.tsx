// STU-UI-11 設定メニュー（共通レイアウト）
import { redirect } from 'next/navigation';
import { getServerToken } from '@/lib/server-auth';
import { fetchProfile } from '@/lib/user-api';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getServerToken();
  if (!token) {
    redirect('/login?from=/settings');
  }

  let globalRole: 'guest' | 'learner' | 'instructor' | 'operator' | 'root_operator' = 'learner';
  try {
    const profile = await fetchProfile(token);
    globalRole = profile.globalRole ?? 'learner';
  } catch {
    globalRole = 'learner';
  }

  return (
    <div className="flex min-h-0 flex-1">
      <SettingsSidebar globalRole={globalRole} />
      <div className="min-w-0 flex-1 p-6">{children}</div>
    </div>
  );
}
