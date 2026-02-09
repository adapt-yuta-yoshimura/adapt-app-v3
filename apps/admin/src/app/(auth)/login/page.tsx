'use client';

import { Button } from '@adapt/ui';

import { useAdminAuth } from '@/hooks/use-admin-auth';

/**
 * Admin ログインページ（Keycloak OIDC）
 * - 「ログイン」ボタン1つのみ → Keycloak 認可画面へリダイレクト
 */
export default function AdminLoginPage(): React.ReactNode {
  const { login } = useAdminAuth();

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{
        background: 'linear-gradient(135deg, #F8F8FF 0%, #FCFCFC 100%)',
      }}
    >
      <span
        className="mb-8 inline-block rounded-full border border-iris-100/30 bg-iris-100/10 px-4 py-1.5 text-badge font-semibold text-iris-100"
        aria-hidden
      >
        管理コンソール
      </span>

      <div className="mb-8 text-center">
        <h1 className="text-heading-lg font-bold text-text-primary">adapt Admin</h1>
        <p className="mt-2 text-body-sm text-text-secondary">運営管理画面</p>
      </div>

      <div className="w-full max-w-[400px] rounded-card-lg bg-surface-white py-12 px-10 shadow-card">
        <h2 className="text-heading font-bold text-text-primary">管理者ログイン</h2>
        <p className="mt-1 text-body-sm text-text-secondary">
          Keycloak で認証してログインしてください
        </p>

        <div className="mt-8">
          <Button type="button" variant="primary" size="lg" className="w-full" onClick={login}>
            ログイン
          </Button>
        </div>
      </div>

      <footer className="mt-12 text-center" role="contentinfo">
        <p className="text-caption text-text-secondary">管理者アカウントでのみログインできます</p>
        <p className="mt-1 text-caption font-medium text-text-secondary">admin.adapt-co.io</p>
      </footer>
    </div>
  );
}
