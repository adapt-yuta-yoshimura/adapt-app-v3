/**
 * ADMIN-01: ダッシュボード API クライアント
 *
 * SoT: openapi_admin.yaml - API-ADMIN-22/23/24
 *
 * TODO(TBD): pnpm generate:types 実行後、OpenAPI 生成型に置換
 */

import { adminApiFetch } from './api-client';

// ---------------------------------------------------------------------------
// 型定義（OpenAPI 準拠・手動定義）
// TODO(TBD): OpenAPI 生成型に置換
// ---------------------------------------------------------------------------

/** KpiCard（SoT: openapi_admin.yaml） */
export type KpiCard = {
  current: number;
  change: number;
  trend: number[];
};

/** DashboardKpiResponse（SoT: openapi_admin.yaml - API-ADMIN-22） */
export type DashboardKpiResponse = {
  learners: KpiCard;
  instructors: KpiCard;
  courses: KpiCard;
  revenue: KpiCard;
};

/** RevenueDataPoint（SoT: openapi_admin.yaml） */
export type RevenueDataPoint = {
  label: string;
  value: number;
};

/** RevenueChartResponse（SoT: openapi_admin.yaml - API-ADMIN-23） */
export type RevenueChartResponse = {
  period: '7D' | '1M' | '6M' | '1Y';
  dataPoints: RevenueDataPoint[];
};

/** AuditEventType enum（SoT: openapi_admin.yaml） */
export type AuditEventType =
  | 'announcement_emergency_posted'
  | 'course_frozen'
  | 'course_unfrozen'
  | 'channel_frozen'
  | 'channel_unfrozen'
  | 'dm_viewed_by_root_operator'
  | 'course_created'
  | 'course_approval_requested'
  | 'course_approved'
  | 'course_published'
  | 'course_member_role_promoted'
  | 'user_frozen'
  | 'user_unfrozen'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'operator_role_changed'
  | 'course_updated'
  | 'course_archived'
  | 'frozen_course_viewed';

/** GlobalRole enum（SoT: openapi_admin.yaml） */
export type GlobalRole =
  | 'guest'
  | 'learner'
  | 'instructor'
  | 'operator'
  | 'root_operator';

/** AuditEvent（SoT: openapi_admin.yaml） */
export type AuditEvent = {
  id: string;
  occurredAt: string;
  actorUserId: string;
  eventType: AuditEventType;
  actorGlobalRole: GlobalRole;
  courseId: string | null;
  channelId: string | null;
  messageId: string | null;
  reason: string;
  metaJson: Record<string, unknown> | null;
  requestId: string | null;
  ipHash: string | null;
  userAgentHash: string | null;
  createdAt: string;
  updatedAt: string;
};

/** DashboardActivitiesResponse（SoT: openapi_admin.yaml - API-ADMIN-24） */
export type DashboardActivitiesResponse = {
  items: AuditEvent[];
};

// ---------------------------------------------------------------------------
// API 定数
// ---------------------------------------------------------------------------

const DASHBOARD_BASE = '/dashboard';

// ---------------------------------------------------------------------------
// API 呼び出し関数
// ---------------------------------------------------------------------------

/**
 * API-ADMIN-22: ダッシュボードKPI集計
 * GET /api/v1/admin/dashboard/kpi
 */
export async function fetchDashboardKpi(): Promise<DashboardKpiResponse> {
  return adminApiFetch<DashboardKpiResponse>(`${DASHBOARD_BASE}/kpi`);
}

/**
 * API-ADMIN-23: 売上推移チャートデータ
 * GET /api/v1/admin/dashboard/revenue-chart?period={period}
 */
export async function fetchRevenueChart(
  period: '7D' | '1M' | '6M' | '1Y',
): Promise<RevenueChartResponse> {
  const search = new URLSearchParams();
  search.set('period', period);
  return adminApiFetch<RevenueChartResponse>(
    `${DASHBOARD_BASE}/revenue-chart?${search.toString()}`,
  );
}

/**
 * API-ADMIN-24: 最近のアクティビティ（監査ログ）
 * GET /api/v1/admin/dashboard/activities?limit={limit}
 */
export async function fetchDashboardActivities(
  limit?: number,
): Promise<DashboardActivitiesResponse> {
  const search = new URLSearchParams();
  if (limit !== undefined) search.set('limit', String(limit));
  const q = search.toString();
  return adminApiFetch<DashboardActivitiesResponse>(
    `${DASHBOARD_BASE}/activities${q ? `?${q}` : ''}`,
  );
}
