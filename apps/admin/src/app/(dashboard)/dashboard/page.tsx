'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Grid,
  Badge,
} from '@adapt/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

import { useAdminStats } from '@/hooks/use-admin-stats';

const fallbackRevenueData = [
  { month: '2025-09', revenue: 120000, count: 12 },
  { month: '2025-10', revenue: 185000, count: 18 },
  { month: '2025-11', revenue: 210000, count: 22 },
  { month: '2025-12', revenue: 175000, count: 16 },
  { month: '2026-01', revenue: 240000, count: 25 },
  { month: '2026-02', revenue: 195000, count: 20 },
];

const fallbackUsersData = [
  { month: '2025-09', count: 45 },
  { month: '2025-10', count: 62 },
  { month: '2025-11', count: 78 },
  { month: '2025-12', count: 55 },
  { month: '2026-01', count: 90 },
  { month: '2026-02', count: 72 },
];

export default function AdminDashboardPage(): React.ReactNode {
  const { data, isLoading } = useAdminStats();

  const stats = [
    {
      label: '総ユーザー数',
      value: data?.totalUsers ?? '-',
      description: '登録済みユーザー',
    },
    {
      label: '総コース数',
      value: data?.totalCourses ?? '-',
      description: '作成済みコース',
    },
    {
      label: '決済件数',
      value: data?.totalPayments ?? '-',
      description: '完了済み決済',
    },
    {
      label: '総売上',
      value: data?.totalRevenue
        ? `¥${data.totalRevenue.toLocaleString()}`
        : '-',
      description: '累計売上金額',
    },
  ];

  const revenueData = data?.revenueByMonth ?? fallbackRevenueData;
  const usersData = data?.usersByMonth ?? fallbackUsersData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground">システム全体の概要</p>
      </div>

      <Grid cols={4} gap="md">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">
                {isLoading ? (
                  <span className="inline-block h-9 w-20 animate-pulse rounded bg-muted" />
                ) : (
                  stat.value
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </Grid>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">月別売上</CardTitle>
            <CardDescription>直近6ヶ月の売上推移</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value: number) => [`¥${value.toLocaleString()}`, '売上']}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">月別新規ユーザー</CardTitle>
            <CardDescription>直近6ヶ月のユーザー登録推移</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usersData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value: number) => [value, '新規ユーザー']}
                  />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">最近の登録ユーザー</CardTitle>
          <CardDescription>直近の新規ユーザー</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.recentUsers && data.recentUsers.length > 0 ? (
            <div className="space-y-3">
              {data.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">最近の登録ユーザーはいません</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
