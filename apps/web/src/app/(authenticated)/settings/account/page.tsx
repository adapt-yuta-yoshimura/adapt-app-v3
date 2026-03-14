// STU-UI-12 アカウント設定（共通）
import { redirect } from 'next/navigation';
import { getServerToken } from '@/lib/server-auth';
import { fetchProfile } from '@/lib/user-api';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { PasswordChangeForm } from '@/components/settings/PasswordChangeForm';

export default async function AccountSettingsPage() {
  const token = await getServerToken();
  if (!token) {
    redirect('/login?from=/settings/account');
  }

  let profile: Awaited<ReturnType<typeof fetchProfile>>;
  try {
    profile = await fetchProfile(token);
  } catch {
    redirect('/login?from=/settings/account');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-black">アカウント設定</h1>
      <p className="mt-1 text-sm text-grey3">STU-UI-12</p>

      <ProfileSection profile={profile} token={token} />
      <PasswordChangeForm token={token} />

      {/* 準備中: SNS連携・2FA・通知設定・言語・アカウント削除 */}
      <section className="mt-8 rounded-lg border border-iris-60 bg-white p-6 opacity-50 pointer-events-none">
        <h2 className="text-lg font-semibold text-black">その他の設定</h2>
        <p className="mt-1 text-sm text-grey3">SNS連携・二段階認証・通知設定・言語/タイムゾーン・アカウント削除</p>
        <p className="text-sm text-grey3 mt-2">これらの機能は現在準備中です</p>
      </section>
    </div>
  );
}
