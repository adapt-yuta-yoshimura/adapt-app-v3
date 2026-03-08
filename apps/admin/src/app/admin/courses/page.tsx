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
import { Plus } from 'lucide-react';
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

  const { data: countAll } = useQuery({
    queryKey: ['admin', 'courses', 'count'],
    queryFn: () => fetchCourseList({ page: 1, perPage: 1 }),
  });
  const { data: countActive } = useQuery({
    queryKey: ['admin', 'courses', 'count', 'active'],
    queryFn: () => fetchCourseList({ status: 'active', page: 1, perPage: 1 }),
  });
  const { data: countPending } = useQuery({
    queryKey: ['admin', 'courses', 'count', 'pending_approval'],
    queryFn: () =>
      fetchCourseList({ status: 'pending_approval', page: 1, perPage: 1 }),
  });

  const kpiTotal = countAll?.meta?.totalCount ?? 0;
  const kpiActive = countActive?.meta?.totalCount ?? 0;
  const kpiPending = countPending?.meta?.totalCount ?? 0;

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
      render: (row) => <CourseStyleBadge style={row.style} />,
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
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            講座管理
          </h1>
          <p className="mt-1 text-sm tracking-wide text-textTertiary">
            講座の一覧・代理作成・凍結管理
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent py-2.5 px-5 text-sm font-semibold tracking-wide text-white shadow-[0_2px_8px_rgba(59,130,246,0.25)] transition-all duration-200 hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" />
          講座を代理作成
        </Link>
      </div>

      {/* KPI カード 4枚（Figma: 全講座数・運用中・承認待ち・凍結中） */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-textTertiary">全講座数</p>
          <p className="mt-2 text-2xl font-bold text-text">{kpiTotal}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-textTertiary">運用中</p>
          <p className="mt-2 text-2xl font-bold text-text">{kpiActive}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-textTertiary">承認待ち</p>
          <p className="mt-2 text-2xl font-bold text-text">{kpiPending}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-textTertiary">凍結中</p>
          <p className="mt-2 text-2xl font-bold text-text">—</p>
          <p className="mt-0.5 text-[10px] text-textMuted">集計API未対応</p>
        </div>
      </div>

      <div className="rounded-[10px] border border-border bg-card px-4 py-3 [&>div]:mb-0">
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
      </div>
      <div className="flex items-center gap-4">
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
        totalCount={data?.meta.totalCount ?? 0}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
