import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { GlobalRole } from '@prisma/client';

/**
 * ダッシュボード集計リポジトリ
 *
 * 複数テーブル（User, Course, Payment, AuditEvent）の集計クエリを担当。
 * SoT: schema.prisma - User, Course, Payment, AuditEvent モデル
 */
@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ユーザー数カウント（globalRole 別）
   * - learner / instructor を個別カウント
   * - isActive=true, deletedAt=null のみ
   */
  async countUsersByRole(globalRole: GlobalRole): Promise<number> {
    return this.prisma.user.count({
      where: {
        globalRole,
        isActive: true,
        deletedAt: null,
      },
    });
  }

  /**
   * 講座数カウント
   * - status != 'archived' を対象
   */
  async countCourses(): Promise<number> {
    return this.prisma.course.count({
      where: { status: { not: 'archived' } },
    });
  }

  /**
   * 今月売上合計
   * - Payment.status = 'succeeded' のみ
   * - paidAt が今月内のもの
   */
  async sumRevenueThisMonth(): Promise<number> {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const result = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'succeeded',
        paidAt: { gte: monthStart },
      },
    });
    return result._sum.amount ?? 0;
  }

  /**
   * 前月売上合計（前月比計算用）
   */
  async sumRevenueLastMonth(): Promise<number> {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    const result = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'succeeded',
        paidAt: { gte: monthStart, lte: monthEnd },
      },
    });
    return result._sum.amount ?? 0;
  }

  /**
   * 直近Nヶ月の月別ユーザー数（globalRole 別）
   */
  async countUsersByRolePerMonth(
    globalRole: GlobalRole,
    points: number,
  ): Promise<number[]> {
    const now = new Date();
    const result: number[] = [];
    for (let i = points - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999));
      const count = await this.prisma.user.count({
        where: {
          globalRole,
          isActive: true,
          deletedAt: null,
          createdAt: { lte: next },
        },
      });
      result.push(count);
    }
    return result;
  }

  /**
   * 直近Nヶ月の月別講座数（status != archived）
   */
  async countCoursesPerMonth(points: number): Promise<number[]> {
    const now = new Date();
    const result: number[] = [];
    for (let i = points - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999));
      const count = await this.prisma.course.count({
        where: {
          status: { not: 'archived' },
          createdAt: { lte: next },
        },
      });
      result.push(count);
    }
    return result;
  }

  /**
   * 直近Nヶ月の月別売上合計
   */
  async sumRevenuePerMonth(points: number): Promise<number[]> {
    const now = new Date();
    const result: number[] = [];
    for (let i = points - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const monthEnd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999));
      const agg = await this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'succeeded',
          paidAt: { gte: d, lte: monthEnd },
        },
      });
      result.push(agg._sum.amount ?? 0);
    }
    return result;
  }

  /**
   * 直近N期間の推移データ（KPI ミニチャート用）
   * - 月別のユーザー数推移、講座数推移、売上推移
   */
  async getTrendData(
    target: 'learners' | 'instructors' | 'courses' | 'revenue',
    points: number,
  ): Promise<number[]> {
    if (target === 'learners') {
      return this.countUsersByRolePerMonth('learner', points);
    }
    if (target === 'instructors') {
      return this.countUsersByRolePerMonth('instructor', points);
    }
    if (target === 'courses') {
      return this.countCoursesPerMonth(points);
    }
    return this.sumRevenuePerMonth(points);
  }

  /**
   * 今月の新規講座数（courses KPI の change 用）
   */
  async countCoursesCreatedThisMonth(): Promise<number> {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    return this.prisma.course.count({
      where: {
        status: { not: 'archived' },
        createdAt: { gte: monthStart },
      },
    });
  }

  /**
   * 前月のユーザー数（前月比用）
   */
  async countUsersByRoleAtEndOfLastMonth(globalRole: GlobalRole): Promise<number> {
    const now = new Date();
    const lastMonthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));
    return this.prisma.user.count({
      where: {
        globalRole,
        isActive: true,
        deletedAt: null,
        createdAt: { lte: lastMonthEnd },
      },
    });
  }

  /**
   * 前月末時点の講座数（前月比用）
   */
  async countCoursesAtEndOfLastMonth(): Promise<number> {
    const now = new Date();
    const lastMonthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));
    return this.prisma.course.count({
      where: {
        status: { not: 'archived' },
        createdAt: { lte: lastMonthEnd },
      },
    });
  }

  /**
   * 売上推移チャートデータ
   * - period に応じたグルーピング（日別 or 月別）
   */
  async aggregateRevenue(
    period: '7D' | '1M' | '6M' | '1Y',
  ): Promise<Array<{ label: string; value: number }>> {
    const now = new Date();
    const result: Array<{ label: string; value: number }> = [];

    if (period === '7D') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setUTCDate(d.getUTCDate() - i);
        const dayStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        const dayEnd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
        const agg = await this.prisma.payment.aggregate({
          _sum: { amount: true },
          where: {
            status: 'succeeded',
            paidAt: { gte: dayStart, lte: dayEnd },
          },
        });
        result.push({
          label: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`,
          value: agg._sum.amount ?? 0,
        });
      }
      return result;
    }

    if (period === '1M') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setUTCDate(d.getUTCDate() - i);
        const dayStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        const dayEnd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
        const agg = await this.prisma.payment.aggregate({
          _sum: { amount: true },
          where: {
            status: 'succeeded',
            paidAt: { gte: dayStart, lte: dayEnd },
          },
        });
        result.push({
          label: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`,
          value: agg._sum.amount ?? 0,
        });
      }
      return result;
    }

    const monthLabels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const count = period === '6M' ? 6 : 12;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const monthEnd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999));
      const agg = await this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'succeeded',
          paidAt: { gte: d, lte: monthEnd },
        },
      });
      result.push({
        label: monthLabels[d.getUTCMonth()],
        value: agg._sum.amount ?? 0,
      });
    }
    return result;
  }

  /**
   * 直近の監査イベント取得
   * - occurredAt 降順
   */
  async findRecentAuditEvents(limit: number): Promise<
    Array<{
      id: string;
      occurredAt: Date;
      actorUserId: string;
      eventType: string;
      actorGlobalRole: string;
      courseId: string | null;
      channelId: string | null;
      messageId: string | null;
      reason: string;
      metaJson: unknown;
      requestId: string | null;
      ipHash: string | null;
      userAgentHash: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>
  > {
    const rows = await this.prisma.auditEvent.findMany({
      orderBy: { occurredAt: 'desc' },
      take: limit,
    });
    return rows.map((r) => ({
      id: r.id,
      occurredAt: r.occurredAt,
      actorUserId: r.actorUserId,
      eventType: r.eventType,
      actorGlobalRole: r.actorGlobalRole,
      courseId: r.courseId,
      channelId: r.channelId,
      messageId: r.messageId,
      reason: r.reason,
      metaJson: r.metaJson as unknown,
      requestId: r.requestId,
      ipHash: r.ipHash,
      userAgentHash: r.userAgentHash,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }
}
