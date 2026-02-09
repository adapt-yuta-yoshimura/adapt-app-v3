'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@adapt/ui';

import { Button } from './Button';

/**
 * Admin DataTable（§2-A-6）
 * ヘッダー #F8F8FF、罫線 #EAEAEA、角丸 8px、ページネーション、ソート、空状態、ローディング
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  pageSize?: number;
}

function TableSkeleton({ colCount }: { colCount: number }): React.ReactNode {
  return (
    <div className="rounded-card border border-border overflow-hidden">
      <div className="h-12 bg-table-header border-b border-border" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex border-b border-border last:border-b-0"
          style={{ height: 52 }}
        >
          {Array.from({ length: colCount }).map((_, j) => (
            <div
              key={j}
              className="flex-1 animate-pulse bg-muted/30 m-2 rounded"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  pagination,
  onPageChange,
  pageSize = 20,
}: DataTableProps<TData, TValue>): React.ReactNode {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination == null ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    manualPagination: pagination != null,
    pageCount: pagination ? Math.ceil(pagination.total / pagination.pageSize) : undefined,
    initialState: {
      pagination: { pageSize },
    },
  });

  const total = pagination?.total ?? data.length;
  const pageIndex = pagination ? pagination.page - 1 : table.getState().pagination.pageIndex;
  const rows = table.getRowModel().rows;
  const canPrev = pagination ? pageIndex > 0 : table.getCanPreviousPage();
  const canNext = pagination
    ? pageIndex < Math.ceil(total / (pagination.pageSize || pageSize)) - 1
    : table.getCanNextPage();

  if (isLoading) {
    return <TableSkeleton colCount={columns.length} />;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-card border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      header.column.getCanSort()
                        ? 'cursor-pointer select-none hover:bg-iris-20/50'
                        : ''
                    }
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && ' ↑'}
                      {header.column.getIsSorted() === 'desc' && ' ↓'}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-text-secondary"
                >
                  データがありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-body-sm text-text-secondary">
          {total} 件中 {rows.length > 0 ? pageIndex * (pagination?.pageSize ?? pageSize) + 1 : 0}-
          {Math.min(
            (pageIndex + 1) * (pagination?.pageSize ?? pageSize),
            total,
          )}{' '}
          件を表示
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (pagination && onPageChange) {
                onPageChange(pageIndex);
              } else {
                table.previousPage();
              }
            }}
            disabled={!canPrev}
          >
            前へ
          </Button>
          <span className="text-body-sm text-text-secondary">
            {pageIndex + 1} / {Math.max(1, Math.ceil(total / (pagination?.pageSize ?? pageSize)))}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (pagination && onPageChange) {
                onPageChange(pageIndex + 2);
              } else {
                table.nextPage();
              }
            }}
            disabled={!canNext}
          >
            次へ
          </Button>
        </div>
      </div>
    </div>
  );
}
