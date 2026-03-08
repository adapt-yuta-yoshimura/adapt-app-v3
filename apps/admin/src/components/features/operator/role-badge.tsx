'use client';

/**
 * ロールバッジ（ADMIN-03）
 * operator / root_operator を視覚的に区別（Figma: Root Operator 青系 / Operator 灰系）
 */
type RoleBadgeProps = {
  role: 'operator' | 'root_operator';
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const isRoot = role === 'root_operator';
  const label = isRoot ? 'Root Operator' : 'Operator';
  const className = isRoot
    ? 'bg-[#dbeafe] text-[#1d4ed8]'
    : 'bg-[#f1f5f9] text-[#475569]';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
