'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@adapt/ui';

/**
 * Admin ログインページ（UI のみ・認証 API 連携なし）
 *
 * 仕様:
 * - メール/パスワードのみ（Google OAuth なし）
 * - 認証先: admin.adapt-co.io（OIDC）
 * - 「管理コンソール」バッジ / 「パスワードをお忘れですか？」/ フッター
 * - 新規アカウント作成リンクは不要（Admin は招待制）
 *
 * デザイン: Figma admin-login 準拠
 * - 背景: linear-gradient(135deg, #F8F8FF 0%, #FCFCFC 100%)
 * - カード: 白、角丸 12px、shadow-card、padding 48px 40px
 * - Input: 46px（lg）/ ボタン: 44px（lg）、iris-100
 */
export default function AdminLoginPage(): React.ReactNode {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    // 認証ロジックは未実装（UI のみ。後日 OIDC / admin.adapt-co.io 連携）
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{
        background: 'linear-gradient(135deg, #F8F8FF 0%, #FCFCFC 100%)',
      }}
    >
      {/* 管理コンソールバッジ */}
      <span
        className="mb-8 inline-block rounded-full border border-iris-100/30 bg-iris-100/10 px-4 py-1.5 text-badge font-semibold text-iris-100"
        aria-hidden
      >
        管理コンソール
      </span>

      {/* ロゴ・タイトル */}
      <div className="mb-8 text-center">
        <h1 className="text-heading-lg font-bold text-text-primary">adapt Admin</h1>
        <p className="mt-2 text-body-sm text-text-secondary">運営管理画面</p>
      </div>

      {/* ログインカード: 白・角丸12px・shadow-card・padding 48px 40px */}
      <div className="w-full max-w-[400px] rounded-card-lg bg-surface-white py-12 px-10 shadow-card">
        <h2 className="text-heading font-bold text-text-primary">管理者ログイン</h2>
        <p className="mt-1 text-body-sm text-text-secondary">
          管理者アカウントでログインしてください
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input
            label="メールアドレス"
            type="email"
            placeholder="admin@adapt-co.io"
            size="lg"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div>
            <Input
              label="パスワード"
              type="password"
              placeholder="パスワード"
              size="lg"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Link
              href="#"
              className="mt-2 inline-block text-body-sm text-text-link hover:underline"
            >
              パスワードをお忘れですか？
            </Link>
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full">
            ログイン
          </Button>
        </form>
      </div>

      {/* フッター */}
      <footer className="mt-12 text-center" role="contentinfo">
        <p className="text-caption text-text-secondary">
          管理者アカウントでのみログインできます
        </p>
        <p className="mt-1 text-caption font-medium text-text-secondary">
          admin.adapt-co.io
        </p>
      </footer>
    </div>
  );
}
