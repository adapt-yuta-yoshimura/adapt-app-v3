'use client';

/**
 * FilterBar（ADMIN-00 共通コンポーネント）
 * - default: 検索 + ステータスラベル付きフィルター
 * - tabs: JSX準拠・検索左・右端にタブ風ボタン（すべて/Active/Frozen）ラベルなし
 */
import { Search } from 'lucide-react';

export interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** default: ラベル付き。tabs: タブ風（右端・ラベルなし・選択時 bg-sidebar text-white） */
  variant?: 'default' | 'tabs';
  filterLabel?: string;
  filterOptions?: { value: string; label: string }[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
}

export function FilterBar({
  searchPlaceholder = '検索...',
  searchValue = '',
  onSearchChange,
  variant = 'default',
  filterLabel,
  filterOptions = [],
  filterValue = '',
  onFilterChange,
}: FilterBarProps) {
  const isTabs = variant === 'tabs';

  return (
    <div className={`flex flex-wrap items-center ${isTabs ? 'justify-between gap-4' : 'gap-4'}`}>
      {onSearchChange && (
        <div className="relative min-w-[200px] max-w-[320px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" aria-hidden />
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-[38px] w-full rounded-lg border border-border bg-card pl-10 pr-3 text-[13px] text-text placeholder:text-textTertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      )}
      {filterOptions.length > 0 && onFilterChange && (
        <div className="flex items-center gap-1">
          {!isTabs && filterLabel && (
            <span className="text-sm text-textSecondary">{filterLabel}</span>
          )}
          <div className={isTabs ? 'flex gap-1' : 'flex rounded-md border border-border bg-card p-0.5'}>
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onFilterChange(opt.value)}
                className={
                  isTabs
                    ? `rounded-md px-3.5 py-1.5 text-xs font-normal transition-colors ${
                        filterValue === opt.value
                          ? 'bg-sidebar font-semibold text-white'
                          : 'bg-transparent text-textTertiary hover:text-textSecondary'
                      }`
                    : `rounded-md px-3 py-1.5 text-xs transition-colors ${
                        filterValue === opt.value
                          ? 'bg-sidebar font-bold text-white'
                          : 'font-normal text-textTertiary hover:bg-border/50'
                      }`
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
