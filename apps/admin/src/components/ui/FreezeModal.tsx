'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@adapt/ui';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useFreezeUser, useUnfreezeUser } from '@/hooks/use-admin-freeze';

/**
 * Admin FreezeModal（§2-A-10）
 * 凍結 / 解除モーダル。理由入力 → API-075 / API-075B 呼び出し
 */
export interface FreezeModalProps {
  mode: 'freeze' | 'unfreeze';
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FreezeModal({ mode, userId, isOpen, onClose }: FreezeModalProps): React.ReactNode {
  const [reason, setReason] = useState('');
  const freezeMutation = useFreezeUser();
  const unfreezeMutation = useUnfreezeUser();

  const mutation = mode === 'freeze' ? freezeMutation : unfreezeMutation;
  const title = mode === 'freeze' ? 'ユーザーを凍結' : '凍結を解除';
  const submitLabel = mode === 'freeze' ? '凍結する' : '解除する';

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (mode === 'freeze') {
        freezeMutation.mutate(
          { userId, reason },
          { onSuccess: () => { setReason(''); onClose(); } },
        );
      } else {
        unfreezeMutation.mutate(
          { userId, reason },
          { onSuccess: () => { setReason(''); onClose(); } },
        );
      }
    },
    [mode, userId, reason, freezeMutation, unfreezeMutation, onClose],
  );

  useEffect(() => {
    if (!isOpen) setReason('');
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            label="理由"
            placeholder={mode === 'freeze' ? '凍結理由を入力' : '解除理由を入力'}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            size="default"
          />
          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={onClose}>
              キャンセル
            </Button>
            <Button
              type="submit"
              variant={mode === 'freeze' ? 'danger' : 'primary'}
              loading={mutation.isPending}
              disabled={!reason.trim()}
            >
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
