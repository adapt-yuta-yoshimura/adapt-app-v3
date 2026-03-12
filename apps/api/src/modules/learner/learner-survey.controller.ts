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
import { LearnerSurveyUseCase } from './learner-survey.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type SurveyDetailView =
  paths['/api/v1/surveys/{surveyId}']['get']['responses']['200']['content']['application/json'];
type SurveyResponseBody =
  paths['/api/v1/surveys/{surveyId}/responses']['post']['requestBody']['content']['application/json'];
type SurveyResponseResult =
  paths['/api/v1/surveys/{surveyId}/responses']['post']['responses']['201']['content']['application/json'];

/**
 * アンケートコントローラ
 *
 * API-023: アンケート取得
 * API-024: アンケート回答
 * SoT: openapi_app.yaml
 */
@Controller('api/v1/surveys')
@UseGuards(AuthGuard, RolesGuard)
export class LearnerSurveyController {
  constructor(private readonly usecase: LearnerSurveyUseCase) {}

  /**
   * API-023: アンケート取得
   * GET /api/v1/surveys/:surveyId
   * x-roles: learner, instructor
   */
  @Get(':surveyId')
  @Roles('learner', 'instructor')
  async getSurvey(
    @Param('surveyId') surveyId: string,
  ): Promise<SurveyDetailView> {
    return this.usecase.getSurvey(surveyId);
  }

  /**
   * API-024: アンケート回答
   * POST /api/v1/surveys/:surveyId/responses
   * x-roles: learner, instructor
   * x-policy: 423_ON_FROZEN
   */
  @Post(':surveyId/responses')
  @Roles('learner', 'instructor')
  async submitResponse(
    @CurrentUser() user: AuthenticatedUser,
    @Param('surveyId') surveyId: string,
    @Body() body: SurveyResponseBody,
  ): Promise<SurveyResponseResult> {
    return this.usecase.submitResponse(surveyId, user.userId, body);
  }
}
