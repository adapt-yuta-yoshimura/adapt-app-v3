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
import { LearnerCourseUseCase } from './learner-course.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type MyCoursesResponse =
  paths['/api/v1/learner/courses']['get']['responses']['200']['content']['application/json'];
type LearnerCourseDetailView =
  paths['/api/v1/learner/courses/{courseId}']['get']['responses']['200']['content']['application/json'];
type SideMenuView =
  paths['/api/v1/learner/courses/{courseId}/side-menu']['get']['responses']['200']['content']['application/json'];
type CompleteBody =
  paths['/api/v1/learner/courses/{courseId}/complete']['post']['requestBody']['content']['application/json'];
type CompleteResponse =
  paths['/api/v1/learner/courses/{courseId}/complete']['post']['responses']['201']['content']['application/json'];

/**
 * 受講者講座コントローラ
 *
 * API-013: マイ講座一覧
 * API-014: 受講中講座詳細
 * API-016: サイドメニュー取得
 * API-022: コース修了処理
 * SoT: openapi_app.yaml
 */
@Controller('api/v1/learner/courses')
@UseGuards(AuthGuard, RolesGuard)
export class LearnerCourseController {
  constructor(private readonly usecase: LearnerCourseUseCase) {}

  /**
   * API-013: マイ講座一覧
   * GET /api/v1/learner/courses
   * x-roles: learner, instructor
   */
  @Get()
  @Roles('learner', 'instructor')
  async getMyCourses(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MyCoursesResponse> {
    return this.usecase.getMyCourses(user.userId);
  }

  /**
   * API-014: 受講中講座詳細
   * GET /api/v1/learner/courses/:courseId
   * x-roles: learner, instructor
   * x-policy: 423_ON_FROZEN
   */
  @Get(':courseId')
  @Roles('learner', 'instructor')
  async getCourseDetail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
  ): Promise<LearnerCourseDetailView> {
    return this.usecase.getCourseDetail(courseId, user.userId);
  }

  /**
   * API-016: サイドメニュー取得
   * GET /api/v1/learner/courses/:courseId/side-menu
   * x-roles: learner, instructor
   */
  @Get(':courseId/side-menu')
  @Roles('learner', 'instructor')
  async getSideMenu(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
  ): Promise<SideMenuView> {
    return this.usecase.getSideMenu(courseId, user.userId);
  }

  /**
   * API-022: コース修了処理
   * POST /api/v1/learner/courses/:courseId/complete
   * x-roles: learner, instructor
   */
  @Post(':courseId/complete')
  @Roles('learner', 'instructor')
  async completeCourse(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Body() body: CompleteBody,
  ): Promise<CompleteResponse> {
    return this.usecase.completeCourse(courseId, user.userId, body);
  }
}
