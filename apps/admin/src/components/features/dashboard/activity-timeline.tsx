'use client';

/**
 * アクティビティタイムライン
 *
 * ADM-UI-02 で使用
 * SoT: openapi_admin.yaml - API-ADMIN-24, DashboardActivitiesResponse, AuditEvent
 *
 * 表示項目:
 * - ヘッダー: 「最近のアクティビティ」
 * - 各行: 時刻 + カテゴリドット + 説明テキスト + カテゴリバッジ
 * - 時刻: 今日 HH:MM / 昨日 / N日前
 */

import Link from 'next/link';
import type { AuditEvent } from '@/lib/admin-dashboard-api';
import {
  formatAuditMessage,
  getUserDetailPath,
} from '@/lib/format-audit-message';
import { ActivityCategoryBadge } from './activity-category-badge';

type ActivityTimelineProps = {
  activities: AuditEvent[];
  isLoading: boolean;
};

function formatOccurredAt(isoString: string): string {
  const d = new Date(isoString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const eventDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (eventDate.getTime() === today.getTime()) {
    return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  }
  if (eventDate.getTime() === yesterday.getTime()) {
    return '昨日';
  }
  const diffDays = Math.floor((today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
  return `${diffDays}日前`;
}

/** eventType + metaJson から表示パーツと実行者を生成 */
function getMessageResult(event: AuditEvent) {
  return formatAuditMessage({
    eventType: event.eventType,
    reason: event.reason,
    metaJson: event.metaJson,
    courseId: event.courseId,
    actorUserId: event.actorUserId,
  });
}

export function ActivityTimeline({
  activities,
  isLoading,
}: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="rounded-[12px] border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-text">最近のアクティビティ</h3>
        <p className="mt-1 text-sm text-textMuted">監査ログ（AuditEventType 準拠）</p>
        <div className="mt-4 flex items-center justify-center py-12 text-textMuted">
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[12px] border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-text">最近のアクティビティ</h3>
      <p className="mt-1 text-sm text-textMuted">監査ログ（AuditEventType 準拠）</p>
      <ul className="mt-4 divide-y divide-border">
        {activities.length === 0 ? (
          <li className="py-6 text-center text-sm text-textMuted">
            アクティビティはありません
          </li>
        ) : (
          activities.map((event) => {
            const result = getMessageResult(event);
            return (
              <li key={event.id} className="flex gap-3 py-4 first:pt-0">
                <span className="w-12 shrink-0 text-right text-xs text-textTertiary">
                  {formatOccurredAt(event.occurredAt)}
                </span>
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      event.eventType.startsWith('user_')
                        ? '#16A34A'
                        : event.eventType.startsWith('course_') || event.eventType.startsWith('channel_')
                          ? '#3B82F6'
                          : event.eventType.includes('frozen') || event.eventType.includes('unfrozen')
                            ? '#DC2626'
                            : '#7C3AED',
                  }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text">
                    {result.parts.map((part, i) => {
                      if (part.type === 'text') {
                        return <span key={i}>{part.text}</span>;
                      }
                      if (part.type === 'userLink') {
                        const href = getUserDetailPath(part.userId, part.globalRole);
                        if (href === '#') return <span key={i}>{part.label}</span>;
                        return (
                          <Link
                            key={i}
                            href={href}
                            className="text-accent hover:underline cursor-pointer"
                          >
                            {part.label}
                          </Link>
                        );
                      }
                      return (
                        <Link
                          key={i}
                          href={`/admin/courses/${part.courseId}`}
                          className="text-accent hover:underline cursor-pointer"
                        >
                          {part.label}
                        </Link>
                      );
                    })}
                  </p>
                  <p className="mt-1 text-xs text-textMuted">
                    実行者: {result.actorLabel}
                  </p>
                  <div className="mt-1">
                    <ActivityCategoryBadge eventType={event.eventType} />
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
      <div className="mt-4 border-t border-border pt-4">
        <Link
          href="/admin/audit-logs"
          className="text-sm font-medium text-accent hover:underline"
        >
          監査ログをすべて表示
        </Link>
      </div>
    </div>
  );
}
