'use client';

/**
 * ADM-UI-13: 講座詳細・監査
 *
 * - Path: /admin/courses/[courseId]
 * - Figma（基本情報）: node-id=8355-2
 * - Figma（監査ログ）: node-id=8356-3
 * - ロール: operator, root_operator（凍結解除は root_operator のみ）
 * - レイアウト: 承認バナー → コース概要カード → 操作ボタン群 → タブ（基本情報|監査ログ）→ 2カラム（講座情報 | 講師・承認・凍結）
 */

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle, Snowflake, Sun, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchCourseList, fetchCourseAudit } from '@/lib/admin-courses-api';
import type { CourseAdminView } from '@/lib/admin-courses-api';
import { CourseDetailPanel } from '@/components/features/course/course-detail-panel';
import { CourseReviewPanel } from '@/components/features/course/course-review-panel';
import { CourseStatusBadge } from '@/components/features/course/course-status-badge';
import { CourseStyleBadge } from '@/components/features/course/course-style-badge';

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

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId as string | undefined;
  const [activeTab, setActiveTab] = React.useState<'detail' | 'audit'>('detail');
  const [showAudit, setShowAudit] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<
    'approve' | 'freeze' | 'unfreeze' | 'delete' | null
  >(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'courses', { page: 1, perPage: 100 }],
    queryFn: () => fetchCourseList({ page: 1, perPage: 100 }),
    enabled: !!courseId,
  });

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['admin', 'courses', 'audit', courseId],
    queryFn: () => fetchCourseAudit(courseId!),
    enabled: !!courseId && (activeTab === 'audit' ? showAudit : false),
  });

  const course = data?.items.find((c) => c.id === courseId) ?? null;

  if (isLoading) {
    return (
      <div className="py-8 text-center text-textMuted">読み込み中...</div>
    );
  }

  if (!course) {
    return (
      <div className="py-8 text-center text-textMuted">
        講座が見つかりません
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* パンくず */}
      <nav className="flex items-center gap-1.5 text-xs text-textMuted">
        <Link href="/admin/dashboard" className="hover:text-textSecondary">
          ホーム
        </Link>
        <span>/</span>
        <Link href="/admin/courses" className="hover:text-textSecondary">
          講座管理
        </Link>
        <span>/</span>
        <span className="text-textSecondary">{course.title}</span>
      </nav>

      {/* ページタイトル + 一覧に戻る */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight text-text">
          講座詳細
        </h1>
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-textSecondary transition-colors hover:bg-bg hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          一覧に戻る
        </Link>
      </div>

      {/* 承認待ちバナー（Figma: 黄背景 + 承認する 右端） */}
      {course.status === 'pending_approval' && !course.isFrozen && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-[#fff7ed] p-4">
          <Clock className="h-5 w-5 shrink-0 text-warning" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-warning">
              承認待ちの講座です
            </p>
            <p className="mt-1 text-sm text-textSecondary">
              承認申請日時:{' '}
              {course.approvalRequestedAt
                ? formatDateTime(course.approvalRequestedAt)
                : '—'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmAction('approve')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-success px-5 py-2 text-[13px] font-semibold text-white hover:bg-success/90"
          >
            <CheckCircle className="h-4 w-4" />
            承認する
          </button>
        </div>
      )}

      {/* 凍結中バナー（Figma: 青背景 + 凍結解除 右端） */}
      {course.isFrozen && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-[#eff6ff] p-4">
          <Snowflake className="h-5 w-5 shrink-0 text-[#1d4ed8]" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#1d4ed8]">
              この講座は凍結中です
            </p>
            <p className="mt-1 text-sm text-textSecondary">
              全ユーザーのアクセスが 423 Locked に制限されています。
            </p>
            <p className="mt-1 text-xs text-textTertiary">
              凍結日時: {formatDateTime(course.frozenAt)} /
              実行者: {course.frozenByUserId ?? '—'}
            </p>
            {course.freezeReason && (
              <p className="mt-2 rounded-md bg-white/60 p-2 text-sm text-textSecondary">
                理由: {course.freezeReason}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setConfirmAction('unfreeze')}
            className="inline-flex items-center gap-1.5 rounded-lg border-0 bg-white px-4 py-2 text-[13px] font-semibold text-[#1d4ed8] shadow-sm hover:bg-gray-50"
          >
            <Sun className="h-4 w-4" />
            凍結解除
          </button>
        </div>
      )}

      {/* コース概要カード（Figma: タイトル + バッジ + ID + 説明） */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-xl font-bold text-text">{course.title}</h2>
          <CourseStatusBadge status={course.status} />
          <CourseStyleBadge style={course.style} />
          {course.isFrozen && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#dbeafe] px-2.5 py-0.5 text-xs font-bold text-[#1d4ed8]">
              <Snowflake className="h-3.5 w-3.5" />
              凍結中
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-textMuted">{course.id}</p>
        {course.description && (
          <p className="mt-3 text-sm leading-relaxed text-textSecondary">
            {course.description}
          </p>
        )}
      </div>

      {/* 操作ボタン群カード（Figma: 代理編集 / 承認 / 凍結 + 右端 論理削除） */}
      <CourseReviewPanel
        course={course}
        courseId={courseId!}
        confirmAction={confirmAction}
        onConfirmActionChange={setConfirmAction}
      />

      {/* タブ: 基本情報 | 監査ログ */}
      <div className="border-b-2 border-border">
        <div className="flex gap-0">
          <button
            type="button"
            onClick={() => setActiveTab('detail')}
            className={`border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'detail'
                ? 'border-accent text-accent'
                : 'border-transparent text-textTertiary hover:text-textSecondary'
            }`}
          >
            基本情報
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`-mb-0.5 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'audit'
                ? 'border-accent text-accent'
                : 'border-transparent text-textTertiary hover:text-textSecondary'
            }`}
          >
            監査ログ
          </button>
        </div>
      </div>

      {/* タブコンテンツ: 基本情報（2カラム） */}
      {activeTab === 'detail' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <CourseDetailPanel course={course} />
          <div className="flex flex-col gap-5">
            <CourseOwnerCard course={course} />
            <CourseApprovalCard course={course} />
            <CourseFrozenCard course={course} />
          </div>
        </div>
      )}

      {/* タブコンテンツ: 監査ログ */}
      {activeTab === 'audit' && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-amber-200 bg-[#fff7ed] px-5 py-3.5 text-xs text-warning">
            <Eye className="h-4 w-4 shrink-0" />
            <span>
              API-ADMIN-08: 監査閲覧は AUDIT_LOG（強制）—
              この画面の閲覧自体が監査ログに記録されます
            </span>
          </div>
          <div className="p-5">
            <h3 className="mb-5 text-[15px] font-bold text-text">
              監査ログ — {course.id}
            </h3>
            {!showAudit && (
              <>
                <p className="text-sm text-textSecondary">
                  監査ログを表示すると、閲覧が記録されます。
                </p>
                <button
                  type="button"
                  className="mt-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-bg"
                  onClick={() => setShowAudit(true)}
                >
                  監査ログを表示
                </button>
              </>
            )}
            {showAudit && auditLoading && (
              <p className="text-sm text-textMuted">読み込み中...</p>
            )}
            {showAudit && !auditLoading && auditData && (
              <AuditLogList events={auditData.auditEvents} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** 講師（オーナー）カード — SoT に ownerName/ownerEmail が無いため ownerUserId のみ表示 */
function CourseOwnerCard({ course }: { course: CourseAdminView }) {
  const initial = course.ownerUserId.slice(0, 1).toUpperCase();
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-[15px] font-bold text-text">
        講師（オーナー）
      </h3>
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-base font-bold text-accent">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-text">
            ID: {course.ownerUserId}
          </p>
          <p className="text-xs text-textMuted">
            （講師名・メールは API 未返却のため ID のみ表示）
          </p>
        </div>
      </div>
    </div>
  );
}

/** 承認情報カード */
function CourseApprovalCard({ course }: { course: CourseAdminView }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-[15px] font-bold text-text">承認情報</h3>
      <DetailRow label="承認申請日時">
        {course.approvalRequestedAt
          ? formatDateTime(course.approvalRequestedAt)
          : <span className="text-textMuted">未申請</span>}
      </DetailRow>
      <DetailRow label="承認日時">
        {course.approvedAt
          ? formatDateTime(course.approvedAt)
          : <span className="text-textMuted">未承認</span>}
      </DetailRow>
      <DetailRow label="承認者">
        {course.approvedByUserId ?? <span className="text-textMuted">—</span>}
      </DetailRow>
    </div>
  );
}

/** 凍結情報カード */
function CourseFrozenCard({ course }: { course: CourseAdminView }) {
  return (
    <div
      className={`rounded-xl border p-6 ${
        course.isFrozen ? 'border-blue-200' : 'border-border bg-card'
      } ${course.isFrozen ? 'bg-card' : ''}`}
    >
      <h3 className="mb-4 text-[15px] font-bold text-text">凍結情報</h3>
      <DetailRow label="凍結状態">
        {course.isFrozen ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#dbeafe] px-2.5 py-0.5 text-xs font-bold text-[#1d4ed8]">
            <Snowflake className="h-3.5 w-3.5" />
            凍結中
          </span>
        ) : (
          <span className="text-sm font-semibold text-success">正常</span>
        )}
      </DetailRow>
      <DetailRow label="凍結日時" muted={!course.isFrozen}>
        {formatDateTime(course.frozenAt)}
      </DetailRow>
      <DetailRow label="凍結実行者" muted={!course.isFrozen}>
        {course.frozenByUserId ?? '—'}
      </DetailRow>
      <DetailRow label="凍結理由" muted={!course.isFrozen}>
        {course.freezeReason ?? '—'}
      </DetailRow>
      {course.isFrozen && (
        <p className="mt-3 rounded-lg bg-accent/10 px-3.5 py-2.5 text-xs text-textTertiary">
          凍結解除は root_operator のみ実行可能（API-ADMIN-07）
        </p>
      )}
    </div>
  );
}

function DetailRow({
  label,
  children,
  muted,
}: {
  label: string;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="flex border-b border-border py-3">
      <dt className="w-[180px] shrink-0 text-[13px] font-semibold text-textTertiary">
        {label}
      </dt>
      <dd
        className={`text-sm ${muted ? 'text-textMuted' : 'text-textSecondary'}`}
      >
        {children}
      </dd>
    </div>
  );
}

function AuditLogList({
  events,
}: {
  events: Array<{
    id: string;
    occurredAt: string;
    eventType: string;
    reason: string;
  }>;
}) {
  if (events.length === 0) {
    return <p className="text-sm text-textMuted">イベントはありません</p>;
  }
  return (
    <ul className="divide-y divide-border text-sm">
      {events.map((ev) => (
        <li key={ev.id} className="py-2">
          <span className="text-textTertiary">
            {new Date(ev.occurredAt).toLocaleString('ja-JP')}
          </span>
          {' — '}
          <span className="font-medium">{ev.eventType}</span>
          {' — '}
          <span className="text-textSecondary">{ev.reason}</span>
        </li>
      ))}
    </ul>
  );
}
