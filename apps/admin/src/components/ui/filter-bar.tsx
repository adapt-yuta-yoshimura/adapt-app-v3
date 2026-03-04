'use client';

/**
 * FilterBar（ADMIN-00 共通コンポーネント）
 * テーブル上部の検索 + ステータスフィルター
 */
export interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterLabel?: string;
  filterOptions?: { value: string; label: string }[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
}

export function FilterBar({
  searchPlaceholder = '検索...',
  searchValue = '',
  onSearchChange,
  filterLabel,
  filterOptions = [],
  filterValue = '',
  onFilterChange,
}: FilterBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4">
      {onSearchChange && (
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      )}
      {filterLabel && filterOptions.length > 0 && onFilterChange && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-textSecondary">{filterLabel}</label>
          <select
            value={filterValue}
            onChange={(e) => onFilterChange(e.target.value)}
            className="rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
          >
            <option value="">すべて</option>
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
