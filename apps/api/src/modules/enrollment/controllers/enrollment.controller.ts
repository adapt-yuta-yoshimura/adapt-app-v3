import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/guards/roles.decorator';
import { CurrentUser } from '../../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/auth/jwt.types';
import { ApplyCourseUseCase } from '../usecases/apply-course.usecase';
import { CreateCheckoutUseCase } from '../usecases/create-checkout.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---

// API-011
type ApplyToCourseBody =
  paths['/api/v1/store/courses/{courseId}/apply']['post']['requestBody']['content']['application/json'];
type ApplyToCourseResponse =
  paths['/api/v1/store/courses/{courseId}/apply']['post']['responses']['201']['content']['application/json'];

// API-012
type CreateCheckoutRequest =
  paths['/api/v1/payments/stripe/checkout']['post']['requestBody']['content']['application/json'];
type CreateCheckoutResponse =
  paths['/api/v1/payments/stripe/checkout']['post']['responses']['201']['content']['application/json'];

/**
 * 申込・決済コントローラ
 *
 * API-011: 講座申込(開始)
 * API-012: Stripeセッション生成
 * SoT: openapi_app.yaml
 */
@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class EnrollmentController {
  constructor(
    private readonly applyUseCase: ApplyCourseUseCase,
    private readonly checkoutUseCase: CreateCheckoutUseCase,
  ) {}

  /**
   * API-011: 講座申込(開始)
   * POST /api/v1/store/courses/:courseId/apply
   * x-roles: learner
   * x-policy: Enrollment(pending)
   */
  @Post('api/v1/store/courses/:courseId/apply')
  @Roles('learner')
  async applyToCourse(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Body() body: ApplyToCourseBody,
  ): Promise<ApplyToCourseResponse> {
    // TODO(TBD): Cursor実装 - ApplyCourseUseCase.execute
    throw new Error('Not implemented');
  }

  /**
   * API-012: Stripeセッション生成
   * POST /api/v1/payments/stripe/checkout
   * x-roles: learner
   * x-policy: 423_ON_FROZEN
   */
  @Post('api/v1/payments/stripe/checkout')
  @Roles('learner')
  async createCheckout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateCheckoutRequest,
  ): Promise<CreateCheckoutResponse> {
    // TODO(TBD): Cursor実装 - CreateCheckoutUseCase.execute
    throw new Error('Not implemented');
  }
}
