'use client';

/**
 * KPIカード（ミニチャート付き）
 *
 * ADM-UI-02 で使用
 * Figma: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8352-3
 *
 * SoT: openapi_admin.yaml - KpiCard
 *
 * 表示項目:
 * - ラベル（受講者数 / 講師数 / 講座数 / 今月売上）
 * - current: 現在値（太字・大きめ）
 * - change: 前月比 or 今月新規（緑 TrendUp アイコン / 赤 TrendDown アイコン）
 * - trend: 直近7ポイントのミニ棒グラフ
 */

import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import type { KpiCard as KpiCardData } from '@/lib/admin-dashboard-api';

type KpiCardProps = {
  label: string;
  data: KpiCardData;
  formatValue?: (value: number) => string;
  changeLabel?: string;
};

const defaultFormat = (v: number) => String(v);

export function KpiCard({
  label,
  data,
  formatValue = defaultFormat,
  changeLabel = '前月比',
}: KpiCardProps) {
  const isPositive = data.change >= 0;
  const trendData = data.trend.map((value, i) => ({ name: `${i + 1}`, value }));

  return (
    <div className="rounded-[12px] border border-border bg-card p-6">
      <p className="text-xs text-textTertiary">{label}</p>
      <p className="mt-1 text-[26px] font-bold text-text">
        {formatValue(data.current)}
      </p>
      <div className="mt-2 flex items-center gap-1">
        {isPositive ? (
          <ArrowUpCircle className="h-4 w-4 text-success" aria-hidden />
        ) : (
          <ArrowDownCircle className="h-4 w-4 text-error" aria-hidden />
        )}
        <span
          className={`text-sm font-medium ${isPositive ? 'text-success' : 'text-error'}`}
        >
          {data.change >= 0 ? '+' : ''}
          {Number.isInteger(data.change) ? data.change : data.change.toFixed(1)}
          {changeLabel === '前月比' ? '%' : ''} {changeLabel}
        </span>
      </div>
      <div className="mt-3 h-10 w-full">
        <ResponsiveContainer width="100%" height={40}>
          <BarChart data={trendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" hide />
            <YAxis hide domain={[0, 'auto']} />
            <Bar dataKey="value" fill="#3B82F6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
