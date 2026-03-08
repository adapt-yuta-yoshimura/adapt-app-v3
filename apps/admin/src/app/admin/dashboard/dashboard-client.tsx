'use client';

/**
 * ダッシュボードクライアント（データ取得・レイアウト）
 *
 * TanStack Query で API-ADMIN-22/23/24 + API-ADMIN-01 を並行取得
 */

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Clock } from 'lucide-react';
import {
  fetchDashboardKpi,
  fetchRevenueChart,
  fetchDashboardActivities,
} from '@/lib/admin-dashboard-api';
import { fetchCourseList } from '@/lib/admin-courses-api';
import type { CourseStyle } from '@/lib/admin-courses-api';
import { KpiCard } from '@/components/features/dashboard/kpi-card';
import { RevenueChart } from '@/components/features/dashboard/revenue-chart';
import { PendingCourses } from '@/components/features/dashboard/pending-courses';
import { ActivityTimeline } from '@/components/features/dashboard/activity-timeline';

export function DashboardClient() {
  const queryClient = useQueryClient();
  const [chartPeriod, setChartPeriod] = useState<'7D' | '1M' | '6M' | '1Y'>('6M');

  const { data: kpi, isLoading: kpiLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'kpi'],
    queryFn: fetchDashboardKpi,
  });

  const { data: revenueChart, isLoading: chartLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'revenue-chart', chartPeriod],
    queryFn: () => fetchRevenueChart(chartPeriod),
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'activities'],
    queryFn: () => fetchDashboardActivities(10),
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: pendingCoursesData, isLoading: pendingLoading } = useQuery({
    queryKey: ['admin', 'courses', { status: 'pending_approval', perPage: 5 }],
    queryFn: () =>
      fetchCourseList({
        status: 'pending_approval',
        perPage: 5,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      }),
  });

  const pendingCourses =
    pendingCoursesData?.items.map((c) => ({
      id: c.id,
      title: c.title,
      style: c.style as CourseStyle,
      ownerUserId: c.ownerUserId,
      approvalRequestedAt: c.approvalRequestedAt,
    })) ?? [];

  const refetchPending = () => {
    queryClient.invalidateQueries({
      queryKey: ['admin', 'courses', { status: 'pending_approval', perPage: 5 }],
    });
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'kpi'] });
  };

  const lastUpdated =
    kpi || revenueChart || activities
      ? new Date().toLocaleString('ja-JP', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-text">
            ダッシュボード
          </h1>
          <p className="mt-1 text-[13px] text-textTertiary">
            adapt プラットフォームの概要
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <p className="flex items-center gap-1.5 text-xs text-textMuted">
              <Clock className="h-4 w-4" />
              最終更新: {lastUpdated}
            </p>
          )}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-border text-textTertiary hover:bg-border/80 hover:text-textSecondary"
            aria-label="通知"
          >
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* KPI カード ×4 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl border border-border bg-card"
            />
          ))
        ) : kpi ? (
          <>
            <KpiCard
              label="受講者数"
              data={kpi.learners}
              changeLabel="前月比"
            />
            <KpiCard
              label="講師数"
              data={kpi.instructors}
              changeLabel="前月比"
            />
            <KpiCard
              label="講座数"
              data={kpi.courses}
              changeLabel="今月新規"
            />
            <KpiCard
              label="今月売上"
              data={kpi.revenue}
              formatValue={(v) => `¥${v.toLocaleString()}`}
              changeLabel="前月比"
            />
          </>
        ) : null}
      </div>

      {/* 2カラム: 売上チャート + 承認待ち講座 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart
            data={revenueChart ?? null}
            period={chartPeriod}
            onPeriodChange={setChartPeriod}
            isLoading={chartLoading}
          />
        </div>
        <div>
          <PendingCourses
            courses={pendingCourses}
            isLoading={pendingLoading}
            onApproved={refetchPending}
          />
        </div>
      </div>

      {/* 最近のアクティビティ（全幅） */}
      <ActivityTimeline
        activities={activities?.items ?? []}
        isLoading={activitiesLoading}
      />
    </div>
  );
}
