'use client';

/**
 * 講座代理作成フォーム
 *
 * ADM-UI-11 で使用
 * Figma JSX 準拠: 作成前に確認モーダル（講座作成の確認）
 *
 * SoT: openapi_admin.yaml - AdminCourseCreateRequest
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { createCourse } from '@/lib/admin-courses-api';
import type {
  CourseStyle,
  CourseCatalogVisibility,
  CourseVisibility,
} from '@/lib/admin-courses-api';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CourseStatusBadge } from './course-status-badge';
import { CourseStyleBadge } from './course-style-badge';
import { CatalogVisibilityBadge } from './catalog-visibility-badge';

const COURSE_STYLE_OPTIONS: {
  value: CourseStyle;
  label: string;
  description: string;
}[] = [
  { value: 'one_on_one', label: '1on1', description: '1対1形式' },
  { value: 'seminar', label: 'セミナー', description: '1対多形式' },
  { value: 'bootcamp', label: 'ブートキャンプ', description: '長期プログラム' },
  { value: 'lecture', label: 'レクチャー', description: '将来用（作成不可の場合あり）' },
];

export function CourseCreateForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = React.useState('');
  const [style, setStyle] = React.useState<CourseStyle>('one_on_one');
  const [ownerUserId, setOwnerUserId] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [catalogVisibility, setCatalogVisibility] =
    React.useState<CourseCatalogVisibility>('public_listed');
  const [visibility, setVisibility] =
    React.useState<CourseVisibility>('public');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<{
    title?: string;
    ownerUserId?: string;
  }>({});

  const validate = (): boolean => {
    const errs: { title?: string; ownerUserId?: string } = {};
    if (!title.trim()) errs.title = '講座タイトルを入力してください';
    if (!ownerUserId.trim())
      errs.ownerUserId = '講師を選択してください';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    if (!validate()) return;
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await createCourse({
        title: title.trim(),
        style,
        ownerUserId: ownerUserId.trim(),
        description: description.trim() || undefined,
        catalogVisibility,
        visibility,
      });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      router.push('/admin/courses');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '講座の作成に失敗しました';
      setError(message);
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-error/10 px-3 py-2.5 text-sm text-error">
          {error}
        </div>
      )}

      {/* 講師（ownerUserId）* */}
      <div className="space-y-1.5">
        <label
          htmlFor="course-owner"
          className="block text-[13px] font-semibold text-textSecondary"
        >
          講師（ownerUserId） <span className="text-error">*</span>
        </label>
        {/* TODO(TBD): Cursor実装 - 講師検索コンポーネント（API-ADMIN-09 で instructor 一覧を取得） */}
        <input
          id="course-owner"
          type="text"
          required
          placeholder="講師のユーザーIDを入力"
          value={ownerUserId}
          onChange={(e) => setOwnerUserId(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-[14px] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {fieldErrors.ownerUserId && (
          <p className="text-sm text-error">{fieldErrors.ownerUserId}</p>
        )}
      </div>

      {/* 講座タイトル* */}
      <div className="space-y-1.5">
        <label
          htmlFor="course-title"
          className="block text-[13px] font-semibold text-textSecondary"
        >
          講座タイトル <span className="text-error">*</span>
        </label>
        <input
          id="course-title"
          type="text"
          required
          placeholder="講座タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-[14px] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {fieldErrors.title && (
          <p className="text-sm text-error">{fieldErrors.title}</p>
        )}
      </div>

      {/* 説明（任意） */}
      <div className="space-y-1.5">
        <label
          htmlFor="course-description"
          className="block text-[13px] font-semibold text-textSecondary"
        >
          説明
        </label>
        <textarea
          id="course-description"
          rows={4}
          placeholder="講座の説明を入力（任意）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-[14px] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* スタイル（CourseStyle）* - 2x2 ラジオカード */}
      <div className="space-y-3">
        <label className="block text-[13px] font-semibold text-textSecondary">
          スタイル（CourseStyle） <span className="text-error">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {COURSE_STYLE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer flex-col gap-1 rounded-lg border-2 px-4 py-3 transition-colors ${
                style === opt.value
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-card hover:border-textTertiary'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="course-style"
                  value={opt.value}
                  checked={style === opt.value}
                  onChange={() => setStyle(opt.value)}
                  className="h-4 w-4 border-border text-accent focus:ring-accent"
                />
                <span className="text-[14px] font-semibold text-text">{opt.label}</span>
              </div>
              <p className="pl-6 text-[11px] text-textTertiary">{opt.description}</p>
            </label>
          ))}
        </div>
      </div>

      {/* カタログ公開設定（CourseCatalogVisibility） */}
      <div className="space-y-1.5">
        <label
          htmlFor="course-catalog-visibility"
          className="block text-[13px] font-semibold text-textSecondary"
        >
          カタログ公開設定（CourseCatalogVisibility）
        </label>
        <select
          id="course-catalog-visibility"
          value={catalogVisibility}
          onChange={(e) =>
            setCatalogVisibility(
              e.target.value as CourseCatalogVisibility,
            )
          }
          className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-[14px] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="public_listed">公開（カタログ掲載）</option>
          <option value="public_unlisted">公開（直リンクのみ）</option>
          <option value="private">非公開</option>
        </select>
      </div>

      {/* コース内公開設定（CourseVisibility） */}
      <div className="space-y-1.5">
        <label
          htmlFor="course-visibility"
          className="block text-[13px] font-semibold text-textSecondary"
        >
          コース内公開設定（CourseVisibility）
        </label>
        <select
          id="course-visibility"
          value={visibility}
          onChange={(e) =>
            setVisibility(e.target.value as CourseVisibility)
          }
          className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-[14px] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="public">全体公開</option>
          <option value="instructors_only">講師のみ</option>
        </select>
      </div>

      <div className="flex gap-3 border-t border-border pt-6">
        <button
          type="button"
          onClick={() => router.push('/admin/courses')}
          className="rounded-lg border border-border bg-card px-5 py-2.5 text-[14px] font-medium text-textSecondary hover:bg-bg"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-accent px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
        >
          {loading ? '作成中...' : '作成する'}
        </button>
      </div>
    </form>

    {/* 講座作成の確認モーダル（JSX batch6 準拠） */}
    <ConfirmDialog
      open={showConfirm}
      onOpenChange={setShowConfirm}
      title="講座作成の確認"
      confirmLabel="作成を確定"
      cancelLabel="戻る"
      variant="default"
      onConfirm={handleConfirm}
      infoBlock={
        <>
          <div><strong>講師（ID）:</strong> {ownerUserId || '—'}</div>
          <div><strong>タイトル:</strong> {title || '—'}</div>
          <div><strong>スタイル:</strong> <CourseStyleBadge style={style} /></div>
          <div><strong>カタログ公開:</strong> <CatalogVisibilityBadge visibility={catalogVisibility} /></div>
          <div><strong>初期ステータス:</strong> <CourseStatusBadge status="draft" /></div>
        </>
      }
    >
      <div className="rounded-lg bg-warning/10 px-3.5 py-2.5 text-xs text-textTertiary">
        ※ API-ADMIN-02 による代理作成。承認免除。公開は講師側の publish 操作で行われます。
      </div>
    </ConfirmDialog>
    </>
  );
}
