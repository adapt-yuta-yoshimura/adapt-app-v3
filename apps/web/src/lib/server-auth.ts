/**
 * サーバーサイド認証ヘルパー（Next.js 15）
 * cookies() は async のため Server Component から利用する。
 */
import { cookies } from 'next/headers';

const AUTH_COOKIE = 'adapt_token';

/**
 * Server Component 用: 認証トークンを取得する。
 * 未ログインの場合は null（middleware で /learner は未認証リダイレクト済みの想定）
 */
export async function getServerToken(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (token) return token;
  return process.env.NEXT_PUBLIC_STUB_TOKEN ?? null;
}
