'use client';

/**
 * 講座詳細表示パネル
 *
 * ADM-UI-13 で使用
 * Figma: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8355-2&m=dev
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

export function CourseDetailPanel({ course }: CourseDetailPanelProps) {
  // TODO(TBD): Cursor実装
  // - 講座詳細情報の完全な表示
  // - ownerUserId からユーザー名の表示（User参照）
  // - 監査ログ一覧の表示（API-ADMIN-08）
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold text-text">講座情報</h2>
      <dl className="space-y-3">
        <div className="flex items-center gap-2">
          <dt className="w-32 text-sm text-textSecondary">講座名</dt>
          <dd className="text-sm text-text">{course.title}</dd>
        </div>

        <div className="flex items-center gap-2">
          <dt className="w-32 text-sm text-textSecondary">ステータス</dt>
          <dd>
            <CourseStatusBadge status={course.status} />
          </dd>
        </div>

        <div className="flex items-center gap-2">
          <dt className="w-32 text-sm text-textSecondary">スタイル</dt>
          <dd>
            <CourseStyleBadge style={course.style} />
          </dd>
        </div>

        <div className="flex items-center gap-2">
          <dt className="w-32 text-sm text-textSecondary">カタログ公開</dt>
          <dd>
            <CatalogVisibilityBadge visibility={course.catalogVisibility} />
          </dd>
        </div>

        {course.description && (
          <div className="flex gap-2">
            <dt className="w-32 text-sm text-textSecondary">説明</dt>
            <dd className="text-sm text-text">{course.description}</dd>
          </div>
        )}

        <div className="flex items-center gap-2">
          <dt className="w-32 text-sm text-textSecondary">担当講師ID</dt>
          <dd className="text-sm text-text">{course.ownerUserId}</dd>
        </div>

        <div className="flex items-center gap-2">
          <dt className="w-32 text-sm text-textSecondary">作成者ID</dt>
          <dd className="text-sm text-text">{course.createdByUserId}</dd>
        </div>

        <div className="flex items-center gap-2">
          <dt className="w-32 text-sm text-textSecondary">凍結状態</dt>
          <dd className="text-sm">
            {course.isFrozen ? (
              <span className="text-error">
                凍結中
                {course.freezeReason && `（理由: ${course.freezeReason}）`}
              </span>
            ) : (
              <span className="text-textMuted">なし</span>
            )}
          </dd>
        </div>

        <div className="flex items-center gap-2">
          <dt className="w-32 text-sm text-textSecondary">作成日</dt>
          <dd className="text-sm text-text">
            {new Date(course.createdAt).toLocaleString('ja-JP')}
          </dd>
        </div>

        <div className="flex items-center gap-2">
          <dt className="w-32 text-sm text-textSecondary">更新日</dt>
          <dd className="text-sm text-text">
            {new Date(course.updatedAt).toLocaleString('ja-JP')}
          </dd>
        </div>
      </dl>
    </div>
  );
}
