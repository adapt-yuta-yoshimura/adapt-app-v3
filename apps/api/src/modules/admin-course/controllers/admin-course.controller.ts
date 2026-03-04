import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/guards/roles.decorator';
import { CurrentUser } from '../../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/auth/jwt.types';
import { AdminCourseUseCase } from '../usecases/admin-course.usecase';

// TODO(TBD): pnpm generate:types 実行後、以下の型を openapi-admin 生成型に置換
// import type { paths } from '@adapt/types/openapi-admin';

/**
 * 講座管理コントローラ（Admin）
 *
 * ADMIN-04チケット: 講座の一覧、代理作成、承認、凍結/解除、削除、監査閲覧
 * SoT: openapi_admin.yaml - API-ADMIN-01〜08
 */
@Controller('api/v1/admin/courses')
@UseGuards(AuthGuard, RolesGuard)
export class AdminCourseController {
  constructor(private readonly usecase: AdminCourseUseCase) {}

  /**
   * API-ADMIN-01: 全講座一覧
   * GET /api/v1/admin/courses
   * x-roles: operator, root_operator
   */
  @Get()
  @Roles('operator', 'root_operator')
  async listCourses(@CurrentUser() user: AuthenticatedUser): Promise<unknown> {
    // TODO(TBD): Cursor実装 - AdminCourseUseCase.listCourses
    // Response: CourseListResponse（items: Course[], meta: ListMeta）
    throw new Error('Not implemented');
  }

  /**
   * API-ADMIN-02: 講座代理作成（運営）
   * POST /api/v1/admin/courses
   * x-roles: operator, root_operator
   * x-policy: AUDIT_LOG
   */
  @Post()
  @Roles('operator', 'root_operator')
  async createCourse(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ): Promise<unknown> {
    // TODO(TBD): Cursor実装 - AdminCourseUseCase.createCourse
    // Request: AdminCourseCreateRequest（title, style, ownerUserId, description?, catalogVisibility?, visibility?）
    // Response: 201 Course / 400 / 401 / 403
    // 処理: ownerUserId=指定講師、status=draft、承認免除
    throw new Error('Not implemented');
  }

  /**
   * API-ADMIN-03: 講座代理編集（運営）
   * PATCH /api/v1/admin/courses/{courseId}
   * x-roles: operator, root_operator
   * x-policy: AUDIT_LOG
   */
  @Patch(':courseId')
  @Roles('operator', 'root_operator')
  async updateCourse(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Body() body: unknown,
  ): Promise<unknown> {
    // TODO(TBD): Cursor実装 - AdminCourseUseCase.updateCourse
    // Request: AdminCourseUpdateRequest（title?, description?, catalogVisibility?, visibility?, ownerUserId?）
    // Response: 200 CourseDetailView / 404
    throw new Error('Not implemented');
  }

  /**
   * API-ADMIN-04: 講座削除（運営）
   * DELETE /api/v1/admin/courses/{courseId}
   * x-roles: operator, root_operator
   * x-policy: AUDIT_LOG
   */
  @Delete(':courseId')
  @Roles('operator', 'root_operator')
  async deleteCourse(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
  ): Promise<unknown> {
    // TODO(TBD): Cursor実装 - AdminCourseUseCase.deleteCourse
    // Response: 200 SuccessResponse / 404
    // 処理: status=archived に変更（論理削除）
    throw new Error('Not implemented');
  }

  /**
   * API-ADMIN-05: 講座承認・審査
   * POST /api/v1/admin/courses/{courseId}/approve
   * x-roles: operator, root_operator
   * x-policy: AUDIT_LOG
   */
  @Post(':courseId/approve')
  @Roles('operator', 'root_operator')
  async approveCourse(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Body() body: unknown,
  ): Promise<unknown> {
    // TODO(TBD): Cursor実装 - AdminCourseUseCase.approveCourse
    // Request: GenericWriteRequest
    // Response: 201 CourseDetailView
    // 処理: status → active、LP公開
    throw new Error('Not implemented');
  }

  /**
   * API-ADMIN-06: コース凍結（運営）
   * POST /api/v1/admin/courses/{courseId}/freeze
   * x-roles: operator, root_operator
   * x-policy: AUDIT_LOG
   */
  @Post(':courseId/freeze')
  @Roles('operator', 'root_operator')
  async freezeCourse(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Body() body: unknown,
  ): Promise<unknown> {
    // TODO(TBD): Cursor実装 - AdminCourseUseCase.freezeCourse
    // Request: GenericWriteRequest
    // Response: 201 CourseDetailView
    // 処理: isFrozen=true、全更新APIを423 Locked
    throw new Error('Not implemented');
  }

  /**
   * API-ADMIN-07: コース凍結解除（運営）
   * POST /api/v1/admin/courses/{courseId}/unfreeze
   * x-roles: root_operator
   */
  @Post(':courseId/unfreeze')
  @Roles('root_operator')
  async unfreezeCourse(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Body() body: unknown,
  ): Promise<unknown> {
    // TODO(TBD): Cursor実装 - AdminCourseUseCase.unfreezeCourse
    // Request: GenericWriteRequest
    // Response: 201 CourseDetailView
    // x-roles: root_operator のみ
    throw new Error('Not implemented');
  }
}
