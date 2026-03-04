import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/guards/roles.decorator';
import { CurrentUser } from '../../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/auth/jwt.types';
import { AdminPaymentUseCase } from '../usecases/admin-payment.usecase';
import type { PaymentListResponse } from '../usecases/admin-payment.usecase';

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
   * x-policy: -（監査ログなし）
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
  ): Promise<PaymentListResponse> {
    const page = pageStr ? parseInt(pageStr, 10) : undefined;
    const perPage = perPageStr ? parseInt(perPageStr, 10) : undefined;
    const sortByValid =
      sortBy && ['createdAt', 'amount', 'status', 'paidAt'].includes(sortBy)
        ? (sortBy as 'createdAt' | 'amount' | 'status' | 'paidAt')
        : undefined;
    const sortOrderValid =
      sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : undefined;

    return this.usecase.listPayments(user.userId, {
      page,
      perPage,
      status,
      sortBy: sortByValid,
      sortOrder: sortOrderValid,
    });
  }
}
