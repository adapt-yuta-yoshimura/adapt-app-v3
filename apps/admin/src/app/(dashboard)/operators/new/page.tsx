'use client';

import Link from 'next/link';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button, FormCard, Input, RoleSelectCard } from '@/components/ui';
import type { RoleSelectValue } from '@/components/ui';
import { useAdminTitle } from '@/contexts/admin-title-context';
import { useCreateOperator } from '@/hooks/use-admin-operators';

/**
 * 運営スタッフ追加（§2-E / API-077）
 * FormCard、メール・RoleSelectCard、AUDIT_LOG 警告、reason のみ送信
 */
export default function OperatorNewPage(): React.ReactNode {
  const setTitle = useAdminTitle();
  useEffect(() => {
    setTitle('運営スタッフ追加');
  }, [setTitle]);

  const router = useRouter();
  const createOperator = useCreateOperator();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<RoleSelectValue>('operator');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await createOperator.mutateAsync({
          reason: `運営スタッフ追加: ${email} (${role})`,
        });
        router.push('/operators');
      } catch (err) {
        if (err instanceof Error && err.message) {
          // エラーは下記の isError ブロックで表示
        }
      }
    },
    [email, role, createOperator, router],
  );

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="md" asChild>
        <Link href="/operators">← 運営スタッフ一覧に戻る</Link>
      </Button>

      <FormCard title="運営スタッフ追加" showAuditWarning>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="メールアドレス"
            required
            type="email"
            placeholder="operator@adapt-co.io"
            size="default"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div>
            <p className="mb-2 text-body-sm font-medium text-text-primary">
              ロール <span className="text-semantic-danger">*</span>
            </p>
            <RoleSelectCard value={role} onChange={setRole} />
          </div>

          <div className="flex flex-wrap gap-3 border-t border-border pt-6">
            <Button type="button" variant="ghost" asChild>
              <Link href="/operators">キャンセル</Link>
            </Button>
            <Button type="submit" variant="primary" loading={createOperator.isPending}>
              追加する
            </Button>
          </div>
        </form>

        {createOperator.isError && (
          <div className="mt-4 rounded-card border border-red-200 bg-red-50 p-4">
            <div className="font-bold text-red-700">エラー</div>
            <div className="text-red-600">
              {createOperator.error?.message ?? '運営スタッフの追加に失敗しました'}
            </div>
          </div>
        )}
      </FormCard>
    </div>
  );
}
