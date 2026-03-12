import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { CurrentUser } from '../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../common/auth/jwt.types';
import { StoreApplyUseCase } from './store-apply.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type ApplyBody =
  paths['/api/v1/store/courses/{courseId}/apply']['post']['requestBody']['content']['application/json'];
type ApplyResponse =
  paths['/api/v1/store/courses/{courseId}/apply']['post']['responses']['201']['content']['application/json'];

/**
 * 講座申込コントローラ
 *
 * API-011: 講座申込(開始)
 * SoT: openapi_app.yaml
 */
@Controller('api/v1/store/courses')
@UseGuards(AuthGuard, RolesGuard)
export class StoreApplyController {
  constructor(private readonly usecase: StoreApplyUseCase) {}

  /**
   * API-011: 講座申込(開始)
   * POST /api/v1/store/courses/:courseId/apply
   * x-roles: learner
   * x-policy: Enrollment(pending)
   */
  @Post(':courseId/apply')
  @Roles('learner')
  async applyCourse(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Body() body: ApplyBody,
  ): Promise<ApplyResponse> {
    return this.usecase.applyCourse(courseId, user.userId, body);
  }
}
