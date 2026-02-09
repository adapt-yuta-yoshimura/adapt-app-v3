'use client';

import { cn } from '@adapt/ui';

/**
 * Admin Badge（§2-A-5）
 * variant: role | status
 * value: ロール名またはステータス名
 */
const ROLE_LABELS: Record<string, string> = {
  root_operator: 'Root',
  operator: 'Operator',
  instructor: 'Instructor',
  learner: 'Learner',
  assistant: 'Assistant',
};

const ROLE_STYLES: Record<string, string> = {
  root_operator: 'bg-purple-100 text-purple-800',
  operator: 'bg-blue-100 text-blue-800',
  instructor: 'bg-green-100 text-green-800',
  learner: 'bg-gray-100 text-gray-800',
  assistant: 'bg-yellow-100 text-yellow-800',
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-semantic-success/10 text-semantic-success',
  frozen: 'bg-semantic-danger/10 text-semantic-danger',
  inactive: 'bg-semantic-danger/10 text-semantic-danger',
};

export interface BadgeProps {
  variant: 'role' | 'status';
  value: string;
  className?: string;
}

export function Badge({ variant, value, className }: BadgeProps): React.ReactNode {
  const isRole = variant === 'role';
  const label = isRole ? (ROLE_LABELS[value] ?? value) : value === 'frozen' ? '凍結' : '有効';
  const styles = isRole
    ? (ROLE_STYLES[value] ?? 'bg-gray-100 text-gray-800')
    : (STATUS_STYLES[value] ?? STATUS_STYLES.active);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border-0 px-2.5 py-0.5 text-badge font-semibold',
        styles,
        className,
      )}
    >
      {label}
    </span>
  );
}
