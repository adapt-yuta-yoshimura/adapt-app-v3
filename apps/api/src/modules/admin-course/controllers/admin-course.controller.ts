import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/guards/roles.decorator';
import { CurrentUser } from '../../../common/guards/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/auth/jwt.types';
import { AdminCourseUseCase } from '../usecases/admin-course.usecase';
import type {
  CourseListResponse,
  CourseResponse,
  SuccessResponse,
} from '../usecases/admin-course.usecase';
import type { CourseStatus, CourseStyle } from '@prisma/client';
import type { GlobalRole } from '@prisma/client';

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
  async listCourses(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('status') status?: CourseStatus,
    @Query('style') style?: CourseStyle,
    @Query('q') titleSearch?: string,
    @Query('sortBy') sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'status',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<CourseListResponse> {
    return this.usecase.listCourses({
      page: page !== undefined ? Number(page) : undefined,
      perPage: perPage !== undefined ? Number(perPage) : undefined,
      status,
      style,
      titleSearch,
      sortBy,
      sortOrder,
    });
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
    @Body()
    body: {
      title: string;
      style: CourseStyle;
      ownerUserId: string;
      description?: string;
      catalogVisibility?: string;
      visibility?: string;
    },
  ): Promise<CourseResponse> {
    return this.usecase.createCourse(
      user.userId,
      user.globalRole as GlobalRole,
      {
        title: body.title,
        style: body.style,
        ownerUserId: body.ownerUserId,
        description: body.description ?? null,
        catalogVisibility: body.catalogVisibility as 'public_listed' | 'public_unlisted' | 'private' | undefined,
        visibility: body.visibility as 'public' | 'instructors_only' | undefined,
      },
      { actorEmail: user.email, actorName: user.name },
    );
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
    @Body()
    body: {
      title?: string;
      description?: string;
      ownerUserId?: string;
      catalogVisibility?: string;
      visibility?: string;
    },
  ): Promise<CourseResponse> {
    return this.usecase.updateCourse(
      user.userId,
      user.globalRole as GlobalRole,
      courseId,
      {
        title: body.title,
        description: body.description !== undefined ? body.description : undefined,
        ownerUserId: body.ownerUserId,
        catalogVisibility: body.catalogVisibility as 'public_listed' | 'public_unlisted' | 'private' | undefined,
        visibility: body.visibility as 'public' | 'instructors_only' | undefined,
      },
      { actorEmail: user.email, actorName: user.name },
    );
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
  ): Promise<SuccessResponse> {
    return this.usecase.deleteCourse(
      user.userId,
      user.globalRole as GlobalRole,
      courseId,
      { actorEmail: user.email, actorName: user.name },
    );
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
    @Body() _body: Record<string, unknown>,
  ): Promise<CourseResponse> {
    return this.usecase.approveCourse(
      user.userId,
      user.globalRole as GlobalRole,
      courseId,
      { actorEmail: user.email, actorName: user.name },
    );
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
    @Body() body: { reason?: string },
  ): Promise<CourseResponse> {
    return this.usecase.freezeCourse(
      user.userId,
      user.globalRole as GlobalRole,
      courseId,
      body,
      { actorEmail: user.email, actorName: user.name },
    );
  }

  /**
   * API-ADMIN-07: コース凍結解除（運営）
   * POST /api/v1/admin/courses/{courseId}/unfreeze
   * x-roles: root_operator のみ
   * x-policy: '-'
   */
  @Post(':courseId/unfreeze')
  @Roles('root_operator')
  async unfreezeCourse(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Body() _body: Record<string, unknown>,
  ): Promise<CourseResponse> {
    return this.usecase.unfreezeCourse(user.userId, courseId);
  }
}
