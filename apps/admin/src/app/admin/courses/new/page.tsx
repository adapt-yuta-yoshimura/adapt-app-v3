'use client';

/**
 * ADM-UI-11: 講座代理作成
 *
 * - Path: /admin/courses/new
 * - Figma: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8354-2&m=dev
 * - ロール: operator, root_operator
 * - API: API-ADMIN-02（作成）、API-ADMIN-09（講師候補の検索用）
 *
 * ADMIN-04チケット参照
 */

import Link from 'next/link';
import { ArrowLeft, Info } from 'lucide-react';
import { CourseCreateForm } from '@/components/features/course/course-create-form';

export default function NewCoursePage() {
  return (
    <div className="flex max-w-[640px] flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-text">
            講座代理作成
          </h1>
          <p className="mt-0.5 text-[13px] text-textTertiary">
            運営が講師に代わって講座を作成します
          </p>
        </div>
        <Link
          href="/admin/courses"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card py-2.5 px-4 text-[13px] font-medium text-textSecondary transition-colors hover:bg-bg hover:text-text"
        >
          ← 一覧に戻る
        </Link>
      </div>

      {/* 情報バナー（Figma: 運営による講座代理作成、初期 draft） */}
      <div className="flex gap-3 rounded-[10px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-4">
        <Info className="h-5 w-5 shrink-0 text-accent" />
        <p className="text-[13px] leading-relaxed text-textSecondary">
          運営による講座代理作成です。初期ステータスは{' '}
          <span className="font-semibold text-text">draft</span>
          （非公開・承認免除）。公開は講師側の publish 操作で行われます。
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-8">
        <h2 className="mb-6 text-[16px] font-bold text-text">講座基本情報</h2>
        <CourseCreateForm />
      </div>
    </div>
  );
}
