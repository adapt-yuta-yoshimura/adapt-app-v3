'use client';

/**
 * ADM-UI-10: 講座一覧（全体）
 *
 * - Path: /admin/courses
 * - Figma: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8353-2&m=dev
 * - ロール: operator, root_operator
 * - API: API-ADMIN-01
 *
 * ADMIN-04チケット参照
 */

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchCourseList } from '@/lib/admin-courses-api';
import type { CourseAdminView } from '@/lib/admin-courses-api';
import { AdminTable } from '@/components/ui/admin-table';
import type { AdminTableColumn } from '@/components/ui/admin-table';
import { FilterBar } from '@/components/ui/filter-bar';
import { CourseStatusBadge } from '@/components/features/course/course-status-badge';
import { CourseStyleBadge } from '@/components/features/course/course-style-badge';
import { CatalogVisibilityBadge } from '@/components/features/course/catalog-visibility-badge';

export default function CoursesPage() {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [styleFilter, setStyleFilter] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState('createdAt');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  const { data, isLoading } = useQuery({
    queryKey: [
      'admin',
      'courses',
      { page, status: statusFilter, style: styleFilter, q: search, sortKey, sortOrder },
    ],
    queryFn: () =>
      fetchCourseList({
        page,
        perPage: 20,
        status: statusFilter || undefined,
        style: styleFilter || undefined,
        q: search.trim() || undefined,
        sortBy: sortKey,
        sortOrder,
      }),
  });

  // ソートは API に委譲（sortKey / sortOrder を queryKey に含め済み）
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const columns: AdminTableColumn<CourseAdminView>[] = [
    {
      key: 'title',
      label: '講座名',
      sortKey: 'title',
      render: (row) => (
        <Link
          href={`/admin/courses/${row.id}`}
          className="text-accent hover:underline"
        >
          {row.title}
        </Link>
      ),
    },
    {
      key: 'status',
      label: 'ステータス',
      sortKey: 'status',
      render: (row) => <CourseStatusBadge status={row.status} />,
    },
    {
      key: 'style',
      label: 'スタイル',
      sortKey: 'style',
      render: (row) =>
        row.style != null ? (
          <CourseStyleBadge style={row.style} />
        ) : (
          <span className="text-textTertiary">—</span>
        ),
    },
    {
      key: 'catalogVisibility',
      label: 'カタログ公開',
      render: (row) => (
        <CatalogVisibilityBadge visibility={row.catalogVisibility} />
      ),
    },
    {
      key: 'isFrozen',
      label: '凍結',
      render: (row) =>
        row.isFrozen ? (
          <span className="text-xs text-error">凍結中</span>
        ) : null,
    },
    {
      key: 'createdAt',
      label: '作成日',
      sortKey: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString('ja-JP'),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">講座管理</h1>
        <Link
          href="/admin/courses/new"
          className="rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90"
        >
          講座を代理作成
        </Link>
      </div>

      <FilterBar
        searchPlaceholder="講座名で検索..."
        searchValue={search}
        onSearchChange={setSearch}
        filterLabel="ステータス"
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { value: '', label: 'すべて' },
          { value: 'draft', label: '下書き' },
          { value: 'pending_approval', label: '承認待ち' },
          { value: 'active', label: '運用中' },
          { value: 'archived', label: 'アーカイブ' },
        ]}
      />
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm text-textSecondary">スタイル</label>
        <select
          value={styleFilter}
          onChange={(e) => setStyleFilter(e.target.value)}
          className="rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
        >
          <option value="">すべて</option>
          <option value="one_on_one">1対1</option>
          <option value="seminar">セミナー</option>
          <option value="bootcamp">ブートキャンプ</option>
          <option value="lecture">レクチャー</option>
        </select>
      </div>

      <AdminTable<CourseAdminView>
        columns={columns}
        data={data?.items ?? []}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        page={page}
        totalPages={data?.meta.totalPages ?? 1}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
