'use client';

/**
 * 講座代理作成フォーム
 *
 * ADM-UI-11 で使用
 * Figma: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8354-2&m=dev
 *
 * SoT: openapi_admin.yaml - AdminCourseCreateRequest
 * - title（必須）
 * - style（必須）: one_on_one | seminar | bootcamp | lecture
 * - ownerUserId（必須）: 講師選択
 * - description（任意）
 * - catalogVisibility（任意）: public_listed | public_unlisted | private
 * - visibility（任意）: public | instructors_only
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

export function CourseCreateForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = React.useState('');
  const [style, setStyle] = React.useState<CourseStyle>('lecture');
  const [ownerUserId, setOwnerUserId] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [catalogVisibility, setCatalogVisibility] =
    React.useState<CourseCatalogVisibility>('public_listed');
  const [visibility, setVisibility] =
    React.useState<CourseVisibility>('public');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<{
    title?: string;
    ownerUserId?: string;
  }>({});

  const validate = (): boolean => {
    const errs: { title?: string; ownerUserId?: string } = {};
    if (!title.trim()) errs.title = '講座名を入力してください';
    if (!ownerUserId.trim())
      errs.ownerUserId = '担当講師を選択してください';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    if (!validate()) return;

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      {error && (
        <div className="rounded-md bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* 講座名（必須） */}
      <div>
        <label
          htmlFor="course-title"
          className="block text-sm font-medium text-textSecondary"
        >
          講座名 <span className="text-error">*</span>
        </label>
        <input
          id="course-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {fieldErrors.title && (
          <p className="mt-1 text-sm text-error">{fieldErrors.title}</p>
        )}
      </div>

      {/* スタイル（必須） */}
      <div>
        <label
          htmlFor="course-style"
          className="block text-sm font-medium text-textSecondary"
        >
          スタイル <span className="text-error">*</span>
        </label>
        <select
          id="course-style"
          value={style}
          onChange={(e) => setStyle(e.target.value as CourseStyle)}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="lecture">講義</option>
          <option value="seminar">セミナー</option>
          <option value="bootcamp">ブートキャンプ</option>
          <option value="one_on_one">1on1</option>
        </select>
      </div>

      {/* 担当講師（必須） */}
      <div>
        <label
          htmlFor="course-owner"
          className="block text-sm font-medium text-textSecondary"
        >
          担当講師（ownerUserId） <span className="text-error">*</span>
        </label>
        {/* TODO(TBD): Cursor実装 - 講師検索コンポーネント（API-ADMIN-09 で instructor 一覧を取得） */}
        <input
          id="course-owner"
          type="text"
          required
          placeholder="講師のユーザーIDを入力"
          value={ownerUserId}
          onChange={(e) => setOwnerUserId(e.target.value)}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {fieldErrors.ownerUserId && (
          <p className="mt-1 text-sm text-error">
            {fieldErrors.ownerUserId}
          </p>
        )}
      </div>

      {/* 説明（任意） */}
      <div>
        <label
          htmlFor="course-description"
          className="block text-sm font-medium text-textSecondary"
        >
          説明
        </label>
        <textarea
          id="course-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* カタログ公開設定（任意） */}
      <div>
        <label
          htmlFor="course-catalog-visibility"
          className="block text-sm font-medium text-textSecondary"
        >
          カタログ公開設定
        </label>
        <select
          id="course-catalog-visibility"
          value={catalogVisibility}
          onChange={(e) =>
            setCatalogVisibility(
              e.target.value as CourseCatalogVisibility,
            )
          }
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="public_listed">公開（カタログ掲載）</option>
          <option value="public_unlisted">公開（直リンクのみ）</option>
          <option value="private">非公開</option>
        </select>
      </div>

      {/* 閲覧設定（任意） */}
      <div>
        <label
          htmlFor="course-visibility"
          className="block text-sm font-medium text-textSecondary"
        >
          閲覧設定
        </label>
        <select
          id="course-visibility"
          value={visibility}
          onChange={(e) =>
            setVisibility(e.target.value as CourseVisibility)
          }
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="public">全体公開</option>
          <option value="instructors_only">講師のみ</option>
        </select>
      </div>

      {/* ボタン */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => router.push('/admin/courses')}
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-bg"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90 disabled:opacity-50"
        >
          {loading ? '作成中...' : '講座を作成'}
        </button>
      </div>
    </form>
  );
}
