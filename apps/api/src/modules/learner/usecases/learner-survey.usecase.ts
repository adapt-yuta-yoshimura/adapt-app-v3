import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { SurveyRepository } from '../repositories/survey.repository';
import { SurveyResponseRepository } from '../repositories/survey-response.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type SurveyDetailView =
  paths['/api/v1/surveys/{surveyId}']['get']['responses']['200']['content']['application/json'];
type SurveyResponseBody =
  paths['/api/v1/surveys/{surveyId}/responses']['post']['requestBody']['content']['application/json'];
type SurveyResponseResult =
  paths['/api/v1/surveys/{surveyId}/responses']['post']['responses']['201']['content']['application/json'];

/**
 * アンケート UseCase
 *
 * API-023: アンケート取得
 * API-024: アンケート回答
 */
@Injectable()
export class LearnerSurveyUseCase {
  constructor(
    private readonly surveyRepo: SurveyRepository,
    private readonly responseRepo: SurveyResponseRepository,
  ) {}

  /**
   * API-023: アンケート取得
   * x-roles: learner, instructor
   */
  async getSurvey(surveyId: string): Promise<SurveyDetailView> {
    // TODO(TBD): Cursor実装
    // 1. Survey 取得
    // 2. SurveyQuestion + SurveyOption を order 順で取得
    throw new Error('Not implemented');
  }

  /**
   * API-024: アンケート回答
   * x-roles: learner, instructor
   * x-policy: 423_ON_FROZEN
   */
  async submitResponse(surveyId: string, userId: string, body: SurveyResponseBody): Promise<SurveyResponseResult> {
    // TODO(TBD): Cursor実装
    // 1. Survey 取得 → courseId → 凍結チェック → HttpException(423)
    // 2. 重複回答チェック（@@unique([surveyId, userId])）→ ConflictException(409)
    // 3. SurveyResponse 作成
    // 4. 各回答: SurveyAnswer 作成
    // 5. 選択式: SurveyAnswerOption 作成
    throw new Error('Not implemented');
  }
}
