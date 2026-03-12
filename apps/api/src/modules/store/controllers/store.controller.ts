import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Public } from '../../../common/guards/public.decorator';
import { StoreUseCase } from '../usecases/store.usecase';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---

// API-009
type GetStoreCoursesResponse =
  paths['/api/v1/store/courses']['get']['responses']['200']['content']['application/json'];

// API-010
type GetStoreCourseDetailResponse =
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
export class StoreController {
  constructor(private readonly usecase: StoreUseCase) {}

  /**
   * API-009: 講座一覧取得（公開）
   * GET /api/v1/store/courses
   * x-roles: guest, all
   */
  @Get()
  @Public()
  async getStoreCourses(): Promise<GetStoreCoursesResponse> {
    // TODO(TBD): Cursor実装 - StoreUseCase.getStoreCourses
    // - query パラメータ（style, keyword, category, page, limit）
    throw new Error('Not implemented');
  }

  /**
   * API-010: 講座詳細取得（公開）
   * GET /api/v1/store/courses/:courseId
   * x-roles: guest, all
   */
  @Get(':courseId')
  @Public()
  async getStoreCourseDetail(
    @Param('courseId') courseId: string,
  ): Promise<GetStoreCourseDetailResponse> {
    // TODO(TBD): Cursor実装 - StoreUseCase.getStoreCourseDetail
    throw new Error('Not implemented');
  }
}
