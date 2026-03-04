'use client';

/**
 * 売上推移チャート
 *
 * ADM-UI-02 で使用
 * SoT: openapi_admin.yaml - RevenueChartResponse, RevenueDataPoint
 *
 * - 期間切替: 7D / 1M / 6M(デフォルト) / 1Y
 * - recharts AreaChart（エリア塗りつぶし付き折れ線）
 * - Y軸: 金額（万円）、X軸: 日付/月名
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { RevenueChartResponse } from '@/lib/admin-dashboard-api';

type RevenueChartProps = {
  data: RevenueChartResponse | null;
  period: '7D' | '1M' | '6M' | '1Y';
  onPeriodChange: (period: '7D' | '1M' | '6M' | '1Y') => void;
  isLoading: boolean;
};

const PERIODS: Array<{ key: '7D' | '1M' | '6M' | '1Y'; label: string }> = [
  { key: '7D', label: '7D' },
  { key: '1M', label: '1M' },
  { key: '6M', label: '6M' },
  { key: '1Y', label: '1Y' },
];

/** 金額を万円表示（Y軸・ツールチップ用） */
function toManYen(value: number): number {
  return Math.round(value / 10000);
}

export function RevenueChart({
  data,
  period,
  onPeriodChange,
  isLoading,
}: RevenueChartProps) {
  const chartData =
    data?.dataPoints.map((d) => ({
      label: d.label,
      value: d.value,
      valueMan: toManYen(d.value),
    })) ?? [];

  return (
    <div className="rounded-[12px] border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text">売上推移</h3>
        <div className="flex gap-1">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onPeriodChange(key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                period === key
                  ? 'bg-accent text-white'
                  : 'bg-bg text-textSecondary hover:bg-border'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-textMuted">
          読み込み中...
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-textMuted">
          データがありません
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${v}`}
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: '万円',
                  position: 'insideTopLeft',
                  fontSize: 10,
                  fill: '#94A3B8',
                }}
              />
              <Tooltip
                formatter={(value: number) => [`${value}万円`, '売上']}
                labelFormatter={(label) => label}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="valueMan"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
