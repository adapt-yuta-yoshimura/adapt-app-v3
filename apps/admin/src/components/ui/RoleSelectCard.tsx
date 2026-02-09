'use client';

import { cn } from '@adapt/ui';

/**
 * Admin RoleSelectCard（§2-A-9）
 * operator / root_operator の2枚カード選択
 */
export type RoleSelectValue = 'operator' | 'root_operator';

export interface RoleSelectCardProps {
  value: RoleSelectValue;
  onChange: (value: RoleSelectValue) => void;
}

const OPTIONS: { value: RoleSelectValue; label: string; description: string }[] = [
  { value: 'operator', label: 'operator', description: '通常の運営権限' },
  { value: 'root_operator', label: 'root_operator', description: '全権限（DM閲覧等）' },
];

export function RoleSelectCard({ value, onChange }: RoleSelectCardProps): React.ReactNode {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-card border-2 px-4 py-3 text-left transition-colors',
              selected
                ? 'border-[#4F46E5] bg-iris-10'
                : 'border-border bg-white hover:bg-muted/30',
            )}
          >
            <span className="text-body-sm font-semibold text-text-primary">{opt.label}</span>
            <p className="mt-1 text-caption text-text-secondary">{opt.description}</p>
          </button>
        );
      })}
    </div>
  );
}
