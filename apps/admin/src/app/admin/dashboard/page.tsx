/**
 * ADM-UI-02: ダッシュボード
 *
 * - Path: /admin/dashboard
 * - ロール: operator, root_operator
 * - Figma: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8352-3
 *
 * ADMIN-01チケット
 *
 * API:
 * - API-ADMIN-22: GET /api/v1/admin/dashboard/kpi
 * - API-ADMIN-23: GET /api/v1/admin/dashboard/revenue-chart
 * - API-ADMIN-24: GET /api/v1/admin/dashboard/activities
 * - API-ADMIN-01: GET /api/v1/admin/courses (status=pending_approval)
 */

import { DashboardClient } from './dashboard-client';

export default function DashboardPage() {
  return <DashboardClient />;
}
