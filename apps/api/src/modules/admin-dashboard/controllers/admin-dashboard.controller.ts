import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/guards/roles.decorator';
import { CurrentUser } from '../../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/auth/jwt.types';
import { AdminDashboardUseCase } from '../usecases/admin-dashboard.usecase';
import type {
  DashboardKpiResponse,
  RevenueChartResponse,
  DashboardActivitiesResponse,
} from '../usecases/admin-dashboard.usecase';

/**
 * ダッシュボード集計コントローラ（Admin）
 *
 * ADMIN-01チケット: ダッシュボード
 * SoT: openapi_admin.yaml - API-ADMIN-22/23/24
 */
@Controller('api/v1/admin/dashboard')
@UseGuards(AuthGuard, RolesGuard)
export class AdminDashboardController {
  constructor(private readonly usecase: AdminDashboardUseCase) {}

  /**
   * API-ADMIN-22: ダッシュボードKPI集計
   * GET /api/v1/admin/dashboard/kpi
   * x-roles: operator, root_operator
   * x-policy: -
   */
  @Get('kpi')
  @Roles('operator', 'root_operator')
  async getKpi(
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<DashboardKpiResponse> {
    return this.usecase.getKpi();
  }

  /**
   * API-ADMIN-23: 売上推移チャートデータ
   * GET /api/v1/admin/dashboard/revenue-chart
   * x-roles: operator, root_operator
   * x-policy: -
   */
  @Get('revenue-chart')
  @Roles('operator', 'root_operator')
  async getRevenueChart(
    @CurrentUser() _user: AuthenticatedUser,
    @Query('period') period: string | undefined,
  ): Promise<RevenueChartResponse> {
    const validPeriods = ['7D', '1M', '6M', '1Y'] as const;
    if (period === undefined || period === '' || !validPeriods.includes(period as (typeof validPeriods)[number])) {
      throw new BadRequestException(
        'period is required and must be one of: 7D, 1M, 6M, 1Y',
      );
    }
    return this.usecase.getRevenueChart(period as (typeof validPeriods)[number]);
  }

  /**
   * API-ADMIN-24: 最近のアクティビティ（監査ログ）
   * GET /api/v1/admin/dashboard/activities
   * x-roles: operator, root_operator
   * x-policy: -
   */
  @Get('activities')
  @Roles('operator', 'root_operator')
  async getActivities(
    @CurrentUser() _user: AuthenticatedUser,
    @Query('limit') limitStr?: string,
  ): Promise<DashboardActivitiesResponse> {
    const limit = limitStr !== undefined && limitStr !== ''
      ? parseInt(limitStr, 10)
      : 10;
    if (Number.isNaN(limit) || limit < 1) {
      return this.usecase.getActivities(10);
    }
    return this.usecase.getActivities(limit);
  }
}
