import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/guards/roles.decorator';
import { CurrentUser } from '../../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/auth/jwt.types';
import { AdminPaymentUseCase } from '../usecases/admin-payment.usecase';

// TODO(TBD): pnpm generate:types 実行後、以下の型を openapi-admin 生成型に置換
// import type { paths } from '@adapt/types/openapi-admin';
// type PaymentListResponse = paths['/api/v1/admin/payments']['get']['responses']['200']['content']['application/json'];

/**
 * 決済管理コントローラ（Admin）
 *
 * ADMIN-05チケット: 決済履歴の一覧
 * SoT: openapi_admin.yaml - API-ADMIN-19
 */
@Controller('api/v1/admin/payments')
@UseGuards(AuthGuard, RolesGuard)
export class AdminPaymentController {
  constructor(private readonly usecase: AdminPaymentUseCase) {}

  /**
   * API-ADMIN-19: 決済履歴一覧
   * GET /api/v1/admin/payments
   * x-roles: operator, root_operator
   */
  @Get()
  @Roles('operator', 'root_operator')
  async listPayments(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') pageStr?: string,
    @Query('perPage') perPageStr?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ): Promise<unknown> {
    // TODO(TBD): Cursor実装 - AdminPaymentUseCase.listPayments
    // Response: PaymentListResponse（items: PaymentSummaryView[], meta: ListMeta）
    // PaymentSummaryView: id, userId, userName, courseId?, courseTitle?, amount, currency, status, provider, paidAt?, createdAt
    const page = pageStr ? parseInt(pageStr, 10) : undefined;
    const perPage = perPageStr ? parseInt(perPageStr, 10) : undefined;
    throw new Error('Not implemented');
  }
}
