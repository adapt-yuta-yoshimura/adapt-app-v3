import { redirect } from 'next/navigation';

/**
 * ルートページ
 * 認証済み → /admin/dashboard へリダイレクト
 * 未認証 → /login へリダイレクト
 */
export default function Home() {
  // TODO(TBD): Cursor実装 - 認証状態に基づくリダイレクト
  redirect('/login');
}
