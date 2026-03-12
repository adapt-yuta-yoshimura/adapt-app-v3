import {
  Controller,
  Get,
  Patch,
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
import { InstructorSubmissionUseCase } from './instructor-submission.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type SubmissionListResponse =
  paths['/api/v1/instructor/courses/{courseId}/submissions']['get']['responses']['200']['content']['application/json'];
type EvaluationBody =
  paths['/api/v1/instructor/submissions/{submissionId}/evaluation']['patch']['requestBody']['content']['application/json'];
type SubmissionView =
  paths['/api/v1/instructor/submissions/{submissionId}/evaluation']['patch']['responses']['200']['content']['application/json'];

/**
 * 提出物管理コントローラ（講師向け）
 *
 * API-043: GET  /api/v1/instructor/courses/{courseId}/submissions — 提出一覧取得
 * API-044: PATCH /api/v1/instructor/submissions/{submissionId}/evaluation — 評価・採点実行
 */
@Controller('api/v1/instructor')
@UseGuards(AuthGuard, RolesGuard)
export class InstructorSubmissionController {
  constructor(private readonly usecase: InstructorSubmissionUseCase) {}

  /** API-043: 提出一覧取得 */
  @Get('courses/:courseId/submissions')
  @Roles('instructor')
  async getSubmissions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
  ): Promise<SubmissionListResponse> {
    return this.usecase.getSubmissions(courseId, user.userId);
  }

  /** API-044: 評価・採点実行 */
  @Patch('submissions/:submissionId/evaluation')
  @Roles('instructor')
  async evaluateSubmission(
    @CurrentUser() user: AuthenticatedUser,
    @Param('submissionId') submissionId: string,
    @Body() body: EvaluationBody,
  ): Promise<SubmissionView> {
    return this.usecase.evaluate(submissionId, body, user.userId);
  }
}
