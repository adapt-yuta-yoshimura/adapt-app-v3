'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button, Input } from '@adapt/ui';
import { PlatformRole } from '@adapt/shared';

/**
 * API-077 POST /api/v1/admin/operators 対応画面（UI のみ・API 連携なし）
 * root_operator のみ / AUDIT_LOG 対象
 */

type FormRole = PlatformRole.OPERATOR | PlatformRole.ROOT_OPERATOR;

interface FormValues {
  name: string;
  email: string;
  role: FormRole | null;
}

const ROLE_OPTIONS: { value: FormRole; label: string; description: string }[] = [
  { value: PlatformRole.OPERATOR, label: 'operator', description: '通常の運営権限' },
  {
    value: PlatformRole.ROOT_OPERATOR,
    label: 'root_operator',
    description: 'DM閲覧・緊急凍結等の特権',
  },
];

export default function OperatorNewPage(): React.ReactNode {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<FormRole | null>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const values: FormValues = { name, email, role };
      // eslint-disable-next-line no-console -- 仕様: submit は console.log で値を出力
      console.log('OperatorNewForm submit:', values);
    },
    [name, email, role],
  );

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="md" asChild>
        <Link href="/operators">← 運営スタッフ一覧に戻る</Link>
      </Button>

      <div className="max-w-[560px] rounded-card border border-border bg-white px-9 py-8">
        <h1 className="text-heading-lg font-bold">運営スタッフ追加</h1>
        <p className="mt-2 text-label text-text-secondary">
          新規運営アカウントを発行します。この操作は監査ログに記録されます。
        </p>

        {/* AUDIT_LOG 警告バナー */}
        <div
          className="mt-6 flex gap-3 rounded-md border p-3"
          style={{
            backgroundColor: 'rgba(245,158,11,0.08)',
            borderColor: 'rgba(245,158,11,0.2)',
          }}
        >
          <AlertTriangle
            className="h-5 w-5 shrink-0 text-semantic-warning"
            aria-hidden
          />
          <p className="text-body-sm text-text-primary">
            AUDIT_LOG 対象操作：実行者・日時・対象が自動記録されます
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="space-y-5">
            <Input
              label="名前"
              required
              placeholder="表示名を入力"
              size="md"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="メールアドレス"
              required
              type="email"
              placeholder="operator@adapt-co.io"
              size="md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div>
              <p className="mb-2 text-body-sm font-medium text-text-primary">
                ロール <span className="text-semantic-danger">*</span>
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {ROLE_OPTIONS.map((opt) => {
                  const selected = role === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value)}
                      className={`rounded-card border-2 px-4 py-3 text-left transition-colors ${
                        selected
                          ? 'border-iris-100 bg-iris-100/[0.04]'
                          : 'border-[#EAEAEA] bg-white hover:bg-muted/30'
                      }`}
                    >
                      <span className="text-body-sm font-semibold text-text-primary">
                        {opt.label}
                      </span>
                      <p className="mt-1 text-caption text-text-secondary">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* フォームアクション: border-top で区切り */}
          <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-6">
            <Button type="button" variant="outline" asChild>
              <Link href="/operators">キャンセル</Link>
            </Button>
            <Button type="submit">スタッフを追加</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
