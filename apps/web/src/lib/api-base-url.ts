/**
 * API ベース URL（Server / Client 両方で利用）
 * 相対 /api は next.config の rewrites でプロキシされるため、クライアントでは /api をそのまま利用可能。
 * Server Component では絶対 URL が必要な場合があるため、環境変数を参照する。
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return ''; // クライアント: 相対パスで /api にプロキシ
  }
  return process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? 'http://localhost:4000';
}
