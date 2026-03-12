import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { StoreCourseRepository } from '../repositories/store-course.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type GetStoreCoursesResponse =
  paths['/api/v1/store/courses']['get']['responses']['200']['content']['application/json'];
type GetStoreCourseDetailResponse =
  paths['/api/v1/store/courses/{courseId}']['get']['responses']['200']['content']['application/json'];

/**
 * ストア講座 UseCase（Facade 型）
 *
 * API-009: 講座一覧取得（公開）
 * API-010: 講座詳細取得（公開）
 */
@Injectable()
export class StoreUseCase {
  constructor(
    private readonly storeCourseRepo: StoreCourseRepository,
  ) {}

  /**
   * API-009: ストア講座一覧
   * x-roles: guest, all
   * ※ 認証不要（guest アクセス可）
   */
  async getStoreCourses(/* query params */): Promise<GetStoreCoursesResponse> {
    // TODO(TBD): Cursor実装
    // - storeCourseRepo.findActivePublic(filters, pagination)
    // - CourseSummaryView への変換
    throw new Error('Not implemented');
  }

  /**
   * API-010: ストア講座詳細
   * x-roles: guest, all
   * ※ 認証不要
   */
  async getStoreCourseDetail(courseId: string): Promise<GetStoreCourseDetailResponse> {
    // TODO(TBD): Cursor実装
    // - storeCourseRepo.findPublicById(courseId)
    // - 404: 存在しない or 非公開
    // - 講師情報結合（User: ownerUserId）
    // - BC の場合: シラバス結合（CourseSection / Lesson）
    throw new Error('Not implemented');
  }
}
