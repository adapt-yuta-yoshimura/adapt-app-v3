import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { CurrentUser } from '../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../common/auth/jwt.types';
import { PaymentUseCase } from './payment.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type CheckoutRequest =
  paths['/api/v1/payments/stripe/checkout']['post']['requestBody']['content']['application/json'];
type CheckoutResponse =
  paths['/api/v1/payments/stripe/checkout']['post']['responses']['201']['content']['application/json'];

/**
 * 決済コントローラ
 *
 * API-012: Stripeセッション生成
 * SoT: openapi_app.yaml
 */
@Controller('api/v1/payments')
@UseGuards(AuthGuard, RolesGuard)
export class PaymentController {
  constructor(private readonly usecase: PaymentUseCase) {}

  /**
   * API-012: Stripeセッション生成
   * POST /api/v1/payments/stripe/checkout
   * x-roles: learner
   * x-policy: 423_ON_FROZEN
   */
  @Post('stripe/checkout')
  @Roles('learner')
  async createCheckoutSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CheckoutRequest,
  ): Promise<CheckoutResponse> {
    return this.usecase.createCheckoutSession(user.userId, body);
  }
}
