import {
  Controller,
  Get,
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
import { LearnerAssignmentUseCase } from './learner-assignment.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type AssignmentListResponse =
  paths['/api/v1/learner/assignments']['get']['responses']['200']['content']['application/json'];
type AssignmentDetailView =
  paths['/api/v1/learner/assignments/{lessonId}']['get']['responses']['200']['content']['application/json'];
type SubmitBody =
  paths['/api/v1/learner/lessons/{lessonId}/submissions']['post']['requestBody']['content']['application/json'];
type SubmissionView =
  paths['/api/v1/learner/lessons/{lessonId}/submissions']['post']['responses']['201']['content']['application/json'];

/**
 * 受講者 課題コントローラ
 *
 * API-017: 自分の課題一覧
 * API-018: 課題詳細取得
 * API-019: 課題提出
 * SoT: openapi_app.yaml
 */
@Controller('api/v1/learner')
@UseGuards(AuthGuard, RolesGuard)
export class LearnerAssignmentController {
  constructor(private readonly usecase: LearnerAssignmentUseCase) {}

  /**
   * API-017: 自分の課題一覧
   * GET /api/v1/learner/assignments
   * x-roles: learner, instructor
   */
  @Get('assignments')
  @Roles('learner', 'instructor')
  async getMyAssignments(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AssignmentListResponse> {
    return this.usecase.getMyAssignments(user.userId);
  }

  /**
   * API-018: 課題詳細取得
   * GET /api/v1/learner/assignments/:lessonId
   * x-roles: learner, instructor
   */
  @Get('assignments/:lessonId')
  @Roles('learner', 'instructor')
  async getAssignmentDetail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('lessonId') lessonId: string,
  ): Promise<AssignmentDetailView> {
    return this.usecase.getAssignmentDetail(lessonId, user.userId);
  }

  /**
   * API-019: 課題提出
   * POST /api/v1/learner/lessons/:lessonId/submissions
   * x-roles: learner, instructor
   * x-policy: 423_ON_FROZEN, threads_only
   */
  @Post('lessons/:lessonId/submissions')
  @Roles('learner', 'instructor')
  async submitAssignment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('lessonId') lessonId: string,
    @Body() body: SubmitBody,
  ): Promise<SubmissionView> {
    return this.usecase.submitAssignment(lessonId, user.userId, body);
  }
}
