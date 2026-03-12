import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/guards/public.decorator';
import { StoreCourseUseCase } from './store-course.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type CourseListResponse =
  paths['/api/v1/store/courses']['get']['responses']['200']['content']['application/json'];
type CourseDetailView =
  paths['/api/v1/store/courses/{courseId}']['get']['responses']['200']['content']['application/json'];

/**
 * ストア講座コントローラ（公開ページ）
 *
 * API-009: 講座一覧取得（公開）
 * API-010: 講座詳細取得（公開）
 * SoT: openapi_app.yaml
 *
 * ※ API-009/010 は未認証（guest）アクセス可 → @Public() デコレータ適用
 */
@Controller('api/v1/store/courses')
@UseGuards(AuthGuard, RolesGuard)
export class StoreCourseController {
  constructor(private readonly usecase: StoreCourseUseCase) {}

  /**
   * API-009: 講座一覧取得（公開）
   * GET /api/v1/store/courses
   * x-roles: guest, all
   */
  @Get()
  @Public()
  async listPublicCourses(): Promise<CourseListResponse> {
    return this.usecase.listPublicCourses();
  }

  /**
   * API-010: 講座詳細取得（公開）
   * GET /api/v1/store/courses/:courseId
   * x-roles: guest, all
   */
  @Get(':courseId')
  @Public()
  async getCourseDetail(
    @Param('courseId') courseId: string,
  ): Promise<CourseDetailView> {
    return this.usecase.getCourseDetail(courseId);
  }
}
