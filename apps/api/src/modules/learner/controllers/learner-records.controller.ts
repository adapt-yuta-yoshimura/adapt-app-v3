import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/guards/roles.decorator';
import { CurrentUser } from '../../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/auth/jwt.types';
import { LearnerRecordsUseCase } from '../usecases/learner-records.usecase';
import { GetRecordsUseCase } from '../usecases/get-records.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type RecordsResponse =
  paths['/api/v1/learner/records']['get']['responses']['200']['content']['application/json'];
type CalendarResponse =
  paths['/api/v1/learner/calendar']['get']['responses']['200']['content']['application/json'];

/**
 * 受講者 学習実績・カレンダーコントローラ
 *
 * API-020: 学習実績取得
 * API-021: カレンダー取得
 * SoT: openapi_app.yaml
 */
@Controller('api/v1/learner')
@UseGuards(AuthGuard, RolesGuard)
export class LearnerRecordsController {
  constructor(
    private readonly usecase: LearnerRecordsUseCase,
    private readonly getRecordsUseCase: GetRecordsUseCase,
  ) {}

  /**
   * API-020: 学習実績取得
   * GET /api/v1/learner/records
   * x-roles: learner, instructor
   */
  @Get('records')
  @Roles('learner', 'instructor')
  async getRecords(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RecordsResponse> {
    return this.getRecordsUseCase.execute(user.userId);
  }

  /**
   * API-021: カレンダー取得
   * GET /api/v1/learner/calendar
   * x-roles: learner, instructor
   */
  @Get('calendar')
  @Roles('learner', 'instructor')
  async getCalendar(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CalendarResponse> {
    return this.usecase.getCalendar(user.userId);
  }
}
