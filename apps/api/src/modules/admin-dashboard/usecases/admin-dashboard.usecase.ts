import { Injectable } from '@nestjs/common';
import { DashboardRepository } from '../repositories/dashboard.repository';

// ---------------------------------------------------------------------------
// 型定義（OpenAPI 準拠・手動定義）
// TODO(TBD): pnpm generate:types 実行後、OpenAPI 生成型に置換
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
export type AuditEventView = {
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
  items: AuditEventView[];
};

/**
 * ダッシュボード集計ユースケース（Admin）
 *
 * ADMIN-01チケット: ダッシュボード
 */
@Injectable()
export class AdminDashboardUseCase {
  constructor(private readonly dashboardRepo: DashboardRepository) {}

  /**
   * API-ADMIN-22: ダッシュボードKPI集計
   * - User count (globalRole=learner) → learners
   * - User count (globalRole=instructor) → instructors
   * - Course count → courses
   * - Payment sum (thisMonth) → revenue
   * - 各: 前月比計算 + 直近7データポイント（courses の change は今月新規件数）
   */
  async getKpi(): Promise<DashboardKpiResponse> {
    const points = 7;
    const [
      learnersCurrent,
      instructorsCurrent,
      coursesCurrent,
      revenueThisMonth,
      revenueLastMonth,
      learnersLastMonth,
      instructorsLastMonth,
      coursesLastMonth,
      coursesNewThisMonth,
      learnersTrend,
      instructorsTrend,
      coursesTrend,
      revenueTrend,
    ] = await Promise.all([
      this.dashboardRepo.countUsersByRole('learner'),
      this.dashboardRepo.countUsersByRole('instructor'),
      this.dashboardRepo.countCourses(),
      this.dashboardRepo.sumRevenueThisMonth(),
      this.dashboardRepo.sumRevenueLastMonth(),
      this.dashboardRepo.countUsersByRoleAtEndOfLastMonth('learner'),
      this.dashboardRepo.countUsersByRoleAtEndOfLastMonth('instructor'),
      this.dashboardRepo.countCoursesAtEndOfLastMonth(),
      this.dashboardRepo.countCoursesCreatedThisMonth(),
      this.dashboardRepo.getTrendData('learners', points),
      this.dashboardRepo.getTrendData('instructors', points),
      this.dashboardRepo.getTrendData('courses', points),
      this.dashboardRepo.getTrendData('revenue', points),
    ]);

    const learnersChange =
      learnersLastMonth > 0
        ? Math.round(((learnersCurrent - learnersLastMonth) / learnersLastMonth) * 1000) / 10
        : 0;
    const instructorsChange =
      instructorsLastMonth > 0
        ? Math.round(((instructorsCurrent - instructorsLastMonth) / instructorsLastMonth) * 1000) / 10
        : 0;
    const revenueChange =
      revenueLastMonth > 0
        ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 1000) / 10
        : 0;

    return {
      learners: {
        current: learnersCurrent,
        change: learnersChange,
        trend: learnersTrend,
      },
      instructors: {
        current: instructorsCurrent,
        change: instructorsChange,
        trend: instructorsTrend,
      },
      courses: {
        current: coursesCurrent,
        change: coursesNewThisMonth,
        trend: coursesTrend,
      },
      revenue: {
        current: revenueThisMonth,
        change: revenueChange,
        trend: revenueTrend,
      },
    };
  }

  /**
   * API-ADMIN-23: 売上推移チャートデータ
   * - Payment を期間別に集計
   * - 7D: 日別7日分, 1M: 日別30日分, 6M: 月別6ヶ月分, 1Y: 月別12ヶ月分
   */
  async getRevenueChart(
    period: '7D' | '1M' | '6M' | '1Y',
  ): Promise<RevenueChartResponse> {
    const dataPoints = await this.dashboardRepo.aggregateRevenue(period);
    return { period, dataPoints };
  }

  /**
   * API-ADMIN-24: 最近のアクティビティ（監査ログ）
   * - AuditEvent findMany(orderBy: occurredAt desc, take: limit)
   */
  async getActivities(
    limit: number,
  ): Promise<DashboardActivitiesResponse> {
    const take = Math.min(100, Math.max(1, limit));
    const rows = await this.dashboardRepo.findRecentAuditEvents(take);
    const items: AuditEventView[] = rows.map((r) => ({
      id: r.id,
      occurredAt: r.occurredAt.toISOString(),
      actorUserId: r.actorUserId,
      eventType: r.eventType as AuditEventType,
      actorGlobalRole: r.actorGlobalRole as GlobalRole,
      courseId: r.courseId,
      channelId: r.channelId,
      messageId: r.messageId,
      reason: r.reason,
      metaJson: r.metaJson as Record<string, unknown> | null,
      requestId: r.requestId,
      ipHash: r.ipHash,
      userAgentHash: r.userAgentHash,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
    return { items };
  }
}
