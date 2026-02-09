'use client';

import type { ReactNode } from 'react';

import { cn } from '@adapt/ui';

/**
 * Admin StatCard（§2-A-7）
 * アイコン + 数値 + ラベル、3列グリッド用
 */
export interface StatCardProps {
  icon: ReactNode;
  value: number | string;
  label: string;
  className?: string;
}

export function StatCard({ icon, value, label, className }: StatCardProps): React.ReactNode {
  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface-white px-5 py-4 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-iris-10 text-iris-100">
          {icon}
        </div>
        <div>
          <p className="text-caption font-semibold text-text-secondary">{label}</p>
          <p className="text-heading-lg font-bold text-text-primary">{value}</p>
        </div>
      </div>
    </div>
  );
}
