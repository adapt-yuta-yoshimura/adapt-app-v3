'use client';

/**
 * 講座詳細表示パネル（基本情報タブ・左カラム）
 *
 * ADM-UI-13 で使用
 * Figma: 講座情報カード — 講座ID / タイトル / 説明 / スタイル / ステータス / カタログ公開 / コース内公開 / 作成者 / 作成日時 / 最終更新
 *
 * SoT: openapi_admin.yaml - Course schema
 */

import type { CourseAdminView } from '@/lib/admin-courses-api';
import { CourseStatusBadge } from './course-status-badge';
import { CourseStyleBadge } from './course-style-badge';
import { CatalogVisibilityBadge } from './catalog-visibility-badge';

type CourseDetailPanelProps = {
  course: CourseAdminView;
};

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${day} ${h}:${min}`;
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex border-b border-border py-3">
      <dt className="w-[180px] shrink-0 text-[13px] font-semibold text-textTertiary">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-sm text-textSecondary">
        {children}
      </dd>
    </div>
  );
}

/** コース内公開（CourseVisibility: public | instructors_only） */
function VisibilityLabel({
  visibility,
}: {
  visibility: 'public' | 'instructors_only';
}) {
  const label = visibility === 'instructors_only' ? '講師のみ' : 'public';
  return <span className="text-sm text-textSecondary">{label}</span>;
}

export function CourseDetailPanel({ course }: CourseDetailPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-[15px] font-bold text-text">講座情報</h3>
      <dl>
        <DetailRow label="講座ID">{course.id}</DetailRow>
        <DetailRow label="タイトル">{course.title}</DetailRow>
        <DetailRow label="説明">
          {course.description ?? (
            <span className="text-textMuted">未設定</span>
          )}
        </DetailRow>
        <DetailRow label="スタイル">
          <CourseStyleBadge style={course.style} />
        </DetailRow>
        <DetailRow label="ステータス">
          <CourseStatusBadge status={course.status} />
        </DetailRow>
        <DetailRow label="カタログ公開">
          <CatalogVisibilityBadge visibility={course.catalogVisibility} />
        </DetailRow>
        <DetailRow label="コース内公開">
          <VisibilityLabel visibility={course.visibility} />
        </DetailRow>
        <DetailRow label="作成者">{course.createdByUserId}</DetailRow>
        <DetailRow label="作成日時">
          {formatDateTime(course.createdAt)}
        </DetailRow>
        <DetailRow label="最終更新">
          {formatDateTime(course.updatedAt)}
        </DetailRow>
      </dl>
    </div>
  );
}
