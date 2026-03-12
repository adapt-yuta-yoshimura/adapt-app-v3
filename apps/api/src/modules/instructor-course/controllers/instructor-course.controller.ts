import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { InstructorCourseUseCase } from '../usecases/instructor-course.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type CourseListResponse =
  paths['/api/v1/instructor/courses']['get']['responses']['200']['content']['application/json'];
type CreateCourseResponse =
  paths['/api/v1/instructor/courses']['post']['responses']['201']['content']['application/json'];
type CourseDetailView =
  paths['/api/v1/instructor/courses/{courseId}']['get']['responses']['200']['content']['application/json'];
type UpdateCourseResponse =
  paths['/api/v1/instructor/courses/{courseId}']['put']['responses']['200']['content']['application/json'];
type DeleteCourseResponse =
  paths['/api/v1/instructor/courses/{courseId}']['delete']['responses']['200']['content']['application/json'];
type RequestApprovalResponse =
  paths['/api/v1/instructor/courses/{courseId}/request-approval']['post']['responses']['201']['content']['application/json'];
type PublishCourseResponse =
  paths['/api/v1/instructor/courses/{courseId}/publish']['post']['responses']['200']['content']['application/json'];

/**
 * 講座管理コントローラ（講師）
 *
 * INS-01チケット: 講師による講座の一覧/作成/詳細/更新/削除/承認申請/公開
 * SoT: openapi_app.yaml - API-025〜031
 */
@Controller('api/v1/instructor')
@UseGuards(AuthGuard, RolesGuard)
export class InstructorCourseController {
  constructor(private readonly usecase: InstructorCourseUseCase) {}

  /**
   * API-025: 自講座一覧
   * GET /api/v1/instructor/courses
   * x-roles: instructor
   */
  @Get('courses')
  @Roles('instructor')
  async listCourses(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CourseListResponse> {
    // TODO(TBD): Cursor実装 - InstructorCourseUseCase.listCourses
    throw new Error('Not implemented');
  }

  /**
   * API-026: 講座新規作成
   * POST /api/v1/instructor/courses
   * x-roles: instructor
   */
  @Post('courses')
  @Roles('instructor')
  async createCourse(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ): Promise<CreateCourseResponse> {
    // TODO(TBD): Cursor実装 - InstructorCourseUseCase.createCourse
    throw new Error('Not implemented');
  }

  /**
   * API-027: 講座詳細取得(管理)
   * GET /api/v1/instructor/courses/:courseId
   * x-roles: instructor
   */
  @Get('courses/:courseId')
  @Roles('instructor')
  async getCourse(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
  ): Promise<CourseDetailView> {
    // TODO(TBD): Cursor実装 - InstructorCourseUseCase.getCourse
    throw new Error('Not implemented');
  }

  /**
   * API-028: 講座情報更新
   * PUT /api/v1/instructor/courses/:courseId
   * x-roles: instructor（GlobalRole） + instructor_owner（CourseMemberRole要確認）
   * x-policy: 423_ON_FROZEN
   */
  @Put('courses/:courseId')
  @Roles('instructor')
  async updateCourse(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Body() body: unknown,
  ): Promise<UpdateCourseResponse> {
    // TODO(TBD): Cursor実装 - InstructorCourseUseCase.updateCourse
    // - instructor_owner（CourseMemberRole）チェックはUseCase層で実装
    // - x-policy: 423_ON_FROZEN（凍結チェック）
    throw new Error('Not implemented');
  }

  /**
   * API-029: 講座削除(論理)
   * DELETE /api/v1/instructor/courses/:courseId
   * x-roles: instructor（GlobalRole） + instructor_owner（CourseMemberRole要確認）
   */
  @Delete('courses/:courseId')
  @Roles('instructor')
  async deleteCourse(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
  ): Promise<DeleteCourseResponse> {
    // TODO(TBD): Cursor実装 - InstructorCourseUseCase.deleteCourse
    // - instructor_owner（CourseMemberRole）チェックはUseCase層で実装
    throw new Error('Not implemented');
  }

  /**
   * API-030: 承認申請
   * POST /api/v1/instructor/courses/:courseId/request-approval
   * x-roles: instructor（GlobalRole） + instructor_owner（CourseMemberRole要確認）
   * x-policy: 423_ON_FROZEN
   */
  @Post('courses/:courseId/request-approval')
  @Roles('instructor')
  async requestApproval(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Body() body: unknown,
  ): Promise<RequestApprovalResponse> {
    // TODO(TBD): Cursor実装 - InstructorCourseUseCase.requestApproval
    // - instructor_owner（CourseMemberRole）チェックはUseCase層で実装
    // - x-policy: 423_ON_FROZEN（凍結チェック）
    throw new Error('Not implemented');
  }

  /**
   * API-031: コース公開
   * POST /api/v1/instructor/courses/:courseId/publish
   * x-roles: instructor（GlobalRole） + instructor_owner（CourseMemberRole要確認）
   * x-policy: AUDIT_LOG
   * 403: ownerUserId不一致
   */
  @Post('courses/:courseId/publish')
  @Roles('instructor')
  async publishCourse(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
  ): Promise<PublishCourseResponse> {
    // TODO(TBD): Cursor実装 - InstructorCourseUseCase.publishCourse
    // - instructor_owner（CourseMemberRole）チェックはUseCase層で実装
    // - x-policy: AUDIT_LOG
    // - 403: ownerUserId不一致
    throw new Error('Not implemented');
  }
}
