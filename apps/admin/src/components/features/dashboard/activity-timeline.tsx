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

/** eventType + metaJson から人間が読める説明を生成 */
function formatDescription(event: AuditEvent): string {
  const meta = event.metaJson as Record<string, unknown> | null;
  const name = meta?.name != null ? String(meta.name) : null;
  const title = meta?.title != null ? String(meta.title) : null;

  switch (event.eventType) {
    case 'user_created':
      return name ? `新規受講者「${name}」が招待により登録` : '新規ユーザーが登録されました';
    case 'user_updated':
      return name ? `ユーザー「${name}」の情報が更新されました` : 'ユーザー情報が更新されました';
    case 'user_deleted':
      return 'ユーザーが論理削除されました';
    case 'course_created':
      return title ? `講座「${title}」が作成されました` : '講座が作成されました';
    case 'course_approval_requested':
      return title ? `講座「${title}」の承認が申請されました` : '講座の承認が申請されました';
    case 'course_approved':
      return title ? `講座「${title}」が承認されました` : '講座が承認されました';
    case 'course_published':
      return title ? `講座「${title}」が公開されました` : '講座が公開されました';
    case 'course_updated':
      return title ? `講座「${title}」が運営により更新されました` : '講座が更新されました';
    case 'course_archived':
      return title ? `講座「${title}」がアーカイブされました` : '講座がアーカイブされました';
    case 'course_frozen':
      return title ? `講座「${title}」が凍結されました` : '講座が凍結されました';
    case 'course_unfrozen':
      return title ? `講座「${title}」の凍結が解除されました` : '講座の凍結が解除されました';
    case 'channel_frozen':
      return 'チャンネルが凍結されました';
    case 'channel_unfrozen':
      return 'チャンネルの凍結が解除されました';
    case 'user_frozen':
      return 'ユーザーが凍結されました';
    case 'user_unfrozen':
      return 'ユーザーの凍結が解除されました';
    case 'operator_role_changed':
      return '運営スタッフのロールが変更されました';
    case 'dm_viewed_by_root_operator':
      return 'root_operator による DM 閲覧が記録されました';
    case 'announcement_emergency_posted':
      return '緊急アナウンスが投稿されました';
    case 'course_member_role_promoted':
      return 'コースメンバーのロールが昇格されました';
    case 'frozen_course_viewed':
      return '凍結講座の監査閲覧が記録されました';
    default:
      return event.reason || event.eventType;
  }
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
          activities.map((event) => (
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
                <p className="text-sm text-text">{formatDescription(event)}</p>
                <div className="mt-1">
                  <ActivityCategoryBadge eventType={event.eventType} />
                </div>
              </div>
            </li>
          ))
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
