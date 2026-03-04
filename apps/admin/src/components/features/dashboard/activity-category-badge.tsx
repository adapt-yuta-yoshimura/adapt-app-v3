'use client';

/**
 * アクティビティカテゴリバッジ
 *
 * ADM-UI-02 で使用
 * SoT: openapi_admin.yaml - AuditEventType
 *
 * カテゴリ分類（指示書準拠）:
 * - ユーザー（緑 #16A34A）: user_created, user_updated, user_deleted
 * - 講座（青 #3B82F6）: course_created, course_approved, course_published, course_updated, course_archived, course_approval_requested
 * - セキュリティ（赤 #DC2626）: course_frozen, course_unfrozen, channel_frozen, channel_unfrozen, user_frozen, user_unfrozen, frozen_course_viewed
 * - 運営（紫 #7C3AED）: operator_role_changed, dm_viewed_by_root_operator, announcement_emergency_posted, course_member_role_promoted
 */

import type { AuditEventType } from '@/lib/admin-dashboard-api';

const USER_EVENTS: AuditEventType[] = [
  'user_created',
  'user_updated',
  'user_deleted',
];

const COURSE_EVENTS: AuditEventType[] = [
  'course_created',
  'course_approved',
  'course_published',
  'course_updated',
  'course_archived',
  'course_approval_requested',
];

const SECURITY_EVENTS: AuditEventType[] = [
  'course_frozen',
  'course_unfrozen',
  'channel_frozen',
  'channel_unfrozen',
  'user_frozen',
  'user_unfrozen',
  'frozen_course_viewed',
];

const OPERATION_EVENTS: AuditEventType[] = [
  'operator_role_changed',
  'dm_viewed_by_root_operator',
  'announcement_emergency_posted',
  'course_member_role_promoted',
];

function getCategory(eventType: AuditEventType): {
  label: string;
  bg: string;
  text: string;
} {
  if (USER_EVENTS.includes(eventType)) {
    return { label: 'ユーザー', bg: '#f0fdf4', text: '#16A34A' };
  }
  if (COURSE_EVENTS.includes(eventType)) {
    return { label: '講座', bg: '#eff6ff', text: '#3B82F6' };
  }
  if (SECURITY_EVENTS.includes(eventType)) {
    return { label: 'セキュリティ', bg: '#fef2f2', text: '#DC2626' };
  }
  if (OPERATION_EVENTS.includes(eventType)) {
    return { label: '運営', bg: '#f5f3ff', text: '#7C3AED' };
  }
  return { label: 'その他', bg: '#f1f5f9', text: '#64748B' };
}

type ActivityCategoryBadgeProps = {
  eventType: AuditEventType;
};

export function ActivityCategoryBadge({ eventType }: ActivityCategoryBadgeProps) {
  const { label, bg, text } = getCategory(eventType);
  return (
    <span
      className="rounded px-2 py-0.5 text-[10px] font-bold"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
}
