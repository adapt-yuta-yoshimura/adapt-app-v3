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
import { SyllabusUseCase } from '../usecases/syllabus.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type SyllabusView =
  paths['/api/v1/instructor/courses/{courseId}/syllabus']['get']['responses']['200']['content']['application/json'];
type AddSectionResponse =
  paths['/api/v1/instructor/courses/{courseId}/sections']['post']['responses']['201']['content']['application/json'];
type UpdateSectionResponse =
  paths['/api/v1/instructor/sections/{sectionId}']['put']['responses']['200']['content']['application/json'];
type DeleteSectionResponse =
  paths['/api/v1/instructor/sections/{sectionId}']['delete']['responses']['200']['content']['application/json'];
type CreateLessonResponse =
  paths['/api/v1/instructor/sections/{sectionId}/lessons']['post']['responses']['201']['content']['application/json'];
type LessonDetailView =
  paths['/api/v1/instructor/lessons/{lessonId}']['get']['responses']['200']['content']['application/json'];
type UpdateLessonResponse =
  paths['/api/v1/instructor/lessons/{lessonId}']['put']['responses']['200']['content']['application/json'];
type DeleteLessonResponse =
  paths['/api/v1/instructor/lessons/{lessonId}']['delete']['responses']['200']['content']['application/json'];

/**
 * シラバス管理コントローラ（講師）
 *
 * INS-01チケット: シラバス構造取得 / セクションCRUD / レッスンCRUD
 * SoT: openapi_app.yaml - API-034〜041
 */
@Controller('api/v1/instructor')
@UseGuards(AuthGuard, RolesGuard)
export class InstructorSyllabusController {
  constructor(private readonly usecase: SyllabusUseCase) {}

  /**
   * API-034: シラバス構造取得
   * GET /api/v1/instructor/courses/:courseId/syllabus
   * x-roles: instructor
   */
  @Get('courses/:courseId/syllabus')
  @Roles('instructor')
  async getSyllabus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
  ): Promise<SyllabusView> {
    // TODO(TBD): Cursor実装 - SyllabusUseCase.getSyllabus
    throw new Error('Not implemented');
  }

  /**
   * API-035: セクション追加
   * POST /api/v1/instructor/courses/:courseId/sections
   * x-roles: instructor
   * x-policy: 423_ON_FROZEN
   */
  @Post('courses/:courseId/sections')
  @Roles('instructor')
  async addSection(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Body() body: unknown,
  ): Promise<AddSectionResponse> {
    // TODO(TBD): Cursor実装 - SyllabusUseCase.addSection
    // - x-policy: 423_ON_FROZEN（凍結チェック）
    throw new Error('Not implemented');
  }

  /**
   * API-036: セクション編集
   * PUT /api/v1/instructor/sections/:sectionId
   * x-roles: instructor
   * x-policy: 423_ON_FROZEN
   */
  @Put('sections/:sectionId')
  @Roles('instructor')
  async updateSection(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sectionId') sectionId: string,
    @Body() body: unknown,
  ): Promise<UpdateSectionResponse> {
    // TODO(TBD): Cursor実装 - SyllabusUseCase.updateSection
    // - x-policy: 423_ON_FROZEN（凍結チェック）
    throw new Error('Not implemented');
  }

  /**
   * API-037: セクション削除
   * DELETE /api/v1/instructor/sections/:sectionId
   * x-roles: instructor
   * x-policy: 423_ON_FROZEN
   */
  @Delete('sections/:sectionId')
  @Roles('instructor')
  async deleteSection(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sectionId') sectionId: string,
  ): Promise<DeleteSectionResponse> {
    // TODO(TBD): Cursor実装 - SyllabusUseCase.deleteSection
    // - x-policy: 423_ON_FROZEN（凍結チェック）
    throw new Error('Not implemented');
  }

  /**
   * API-038: レッスン作成
   * POST /api/v1/instructor/sections/:sectionId/lessons
   * x-roles: instructor
   * x-policy: 423_ON_FROZEN
   */
  @Post('sections/:sectionId/lessons')
  @Roles('instructor')
  async createLesson(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sectionId') sectionId: string,
    @Body() body: unknown,
  ): Promise<CreateLessonResponse> {
    // TODO(TBD): Cursor実装 - SyllabusUseCase.createLesson
    // - x-policy: 423_ON_FROZEN（凍結チェック）
    throw new Error('Not implemented');
  }

  /**
   * API-039: レッスン詳細取得
   * GET /api/v1/instructor/lessons/:lessonId
   * x-roles: instructor
   */
  @Get('lessons/:lessonId')
  @Roles('instructor')
  async getLesson(
    @CurrentUser() user: AuthenticatedUser,
    @Param('lessonId') lessonId: string,
  ): Promise<LessonDetailView> {
    // TODO(TBD): Cursor実装 - SyllabusUseCase.getLesson
    // レスポンス型: GenericDetailView（additionalProperties: true）
    throw new Error('Not implemented');
  }

  /**
   * API-040: レッスン編集
   * PUT /api/v1/instructor/lessons/:lessonId
   * x-roles: instructor
   * x-policy: 423_ON_FROZEN
   */
  @Put('lessons/:lessonId')
  @Roles('instructor')
  async updateLesson(
    @CurrentUser() user: AuthenticatedUser,
    @Param('lessonId') lessonId: string,
    @Body() body: unknown,
  ): Promise<UpdateLessonResponse> {
    // TODO(TBD): Cursor実装 - SyllabusUseCase.updateLesson
    // - x-policy: 423_ON_FROZEN（凍結チェック）
    throw new Error('Not implemented');
  }

  /**
   * API-041: レッスン削除
   * DELETE /api/v1/instructor/lessons/:lessonId
   * x-roles: instructor
   * x-policy: 423_ON_FROZEN
   */
  @Delete('lessons/:lessonId')
  @Roles('instructor')
  async deleteLesson(
    @CurrentUser() user: AuthenticatedUser,
    @Param('lessonId') lessonId: string,
  ): Promise<DeleteLessonResponse> {
    // TODO(TBD): Cursor実装 - SyllabusUseCase.deleteLesson
    // - x-policy: 423_ON_FROZEN（凍結チェック）
    throw new Error('Not implemented');
  }
}
