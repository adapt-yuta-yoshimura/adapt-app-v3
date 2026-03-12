import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/guards/roles.decorator';
import { CurrentUser } from '../../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/auth/jwt.types';
import { GetEnrollmentStatusUseCase } from '../usecases/get-enrollment-status.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type EnrollmentDetailView =
  paths['/api/v1/learner/enrollments/{enrollmentId}']['get']['responses']['200']['content']['application/json'];

/**
 * 受講者 Enrollment コントローラ
 *
 * API-015: 決済/申込状況確認
 * SoT: openapi_app.yaml
 */
@Controller('api/v1/learner/enrollments')
@UseGuards(AuthGuard, RolesGuard)
export class LearnerEnrollmentController {
  constructor(
    private readonly getEnrollmentStatusUseCase: GetEnrollmentStatusUseCase,
  ) {}

  /**
   * API-015: 決済/申込状況確認
   * GET /api/v1/learner/enrollments/:enrollmentId
   * x-roles: learner, instructor
   */
  @Get(':enrollmentId')
  @Roles('learner', 'instructor')
  async getEnrollmentStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('enrollmentId') enrollmentId: string,
  ): Promise<EnrollmentDetailView> {
    return this.getEnrollmentStatusUseCase.execute(user.userId, enrollmentId);
  }
}
