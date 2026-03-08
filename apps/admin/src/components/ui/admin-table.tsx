'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * AdminTable（ADMIN-00 共通コンポーネント）
 * JSX準拠: ヘッダークリックソート + テーブル + ページネーション（表示件数 select + X件中 Y–Z件 + prev/numbers/next）
 */
export interface AdminTableColumn<T> {
  key: string;
  label: string;
  sortKey?: string;
  render: (row: T) => React.ReactNode;
}

export interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[];
  data: T[];
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  page?: number;
  totalPages?: number;
  totalCount?: number;
  perPage?: number;
  perPageOptions?: number[];
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  isLoading?: boolean;
}

export function AdminTable<T extends object>({
  columns,
  data,
  sortKey,
  sortOrder,
  onSort,
  page = 1,
  totalPages = 1,
  totalCount,
  perPage = 20,
  perPageOptions = [5, 10, 50, 100],
  onPageChange,
  onPerPageChange,
  isLoading = false,
}: AdminTableProps<T>) {
  const total = totalCount ?? data.length;
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm tracking-wide">
          <thead>
            <tr className="bg-bg">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="border-b border-border px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-textTertiary"
                >
                  {col.sortKey ? (
                    <button
                      type="button"
                      onClick={() => onSort?.(col.sortKey ?? col.key)}
                      className="inline-flex cursor-pointer select-none items-center gap-1 hover:text-text focus:outline-none"
                    >
                      <span>{col.label}</span>
                      {sortKey === (col.sortKey ?? col.key) ? (
                        <span className="text-[10px] text-accent">
                          {sortOrder === 'asc' ? '▲' : '▼'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-textMuted">⇅</span>
                      )}
                    </button>
                  ) : (
                    <span className="font-semibold uppercase tracking-wider text-textTertiary">
                      {col.label}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-textMuted">
                  読み込み中...
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border last:border-b-0 transition-colors hover:bg-bg/50"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-3.5 text-[13px] text-text">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* JSX準拠: 表示件数 + X件中 Y–Z件 + prev/numbers/next */}
      <div className="flex items-center justify-between border-t border-border bg-[#FAFBFC] px-6 py-3">
        <div className="flex items-center gap-3">
          {onPerPageChange && (
            <>
              <span className="text-xs text-textTertiary">表示件数</span>
              <select
                value={perPage}
                onChange={(e) => {
                  onPerPageChange(Number(e.target.value));
                  onPageChange?.(1);
                }}
                className="rounded-md border border-border bg-card px-2 py-1 text-xs text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {perPageOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}件
                  </option>
                ))}
              </select>
            </>
          )}
          <span className="text-xs text-textTertiary">
            {total} 件中 {total === 0 ? 0 : start}–{end} 件
          </span>
        </div>
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-textTertiary transition-opacity hover:enabled:text-text disabled:cursor-default disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onPageChange(n)}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                  n === page
                    ? 'border-0 bg-sidebar text-white'
                    : 'border border-border bg-card text-textTertiary hover:text-text'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-textTertiary transition-opacity hover:enabled:text-text disabled:cursor-default disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
