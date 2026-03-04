'use client';

/**
 * ロールバッジ（ADMIN-03）
 *
 * operator / root_operator を視覚的に区別するバッジコンポーネント
 * 指示書: operator 灰色系 / root_operator 青色系（accent #3B82F6）
 */

type RoleBadgeProps = {
  role: 'operator' | 'root_operator';
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const isRoot = role === 'root_operator';
  const label = isRoot ? 'Root' : 'Operator';
  const className = isRoot
    ? 'bg-accent/10 text-accent'
    : 'bg-border text-textSecondary';

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
