'use client';

import * as React from 'react';

/**
 * AdminTable（ADMIN-00 共通コンポーネント）
 * shadcn/ui Table + ヘッダークリックソート + ページネーションの枠
 * 他チケットで中身を実装
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
  onPageChange?: (page: number) => void;
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
  onPageChange,
  isLoading = false,
}: AdminTableProps<T>) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-bg">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 font-medium text-textSecondary"
                >
                  {col.sortKey ? (
                    <button
                      type="button"
                      onClick={() => onSort?.(col.sortKey ?? col.key)}
                      className="hover:text-text"
                    >
                      {col.label}
                      {sortKey === (col.sortKey ?? col.key) && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-textMuted">
                  読み込み中...
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-text">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded px-2 py-1 text-sm disabled:opacity-50"
          >
            前へ
          </button>
          <span className="text-sm text-textTertiary">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded px-2 py-1 text-sm disabled:opacity-50"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
