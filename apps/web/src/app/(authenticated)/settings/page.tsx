// STU-UI-11: /settings 直アクセス時は /settings/account へリダイレクト
import { redirect } from 'next/navigation';

export default function SettingsIndexPage() {
  redirect('/settings/account');
}
