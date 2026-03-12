import { Injectable } from '@nestjs/common';
import type { paths } from '@adapt/types/openapi-app';
import { StoreCourseRepository } from './store-course.repository';

// --- OpenAPI 生成型（SoT: openapi_app.yaml） ---
type CourseListResponse =
  paths['/api/v1/store/courses']['get']['responses']['200']['content']['application/json'];
type CourseDetailView =
  paths['/api/v1/store/courses/{courseId}']['get']['responses']['200']['content']['application/json'];

/**
 * ストア講座 UseCase（公開ページ）
 *
 * API-009: 講座一覧取得（公開）
 * API-010: 講座詳細取得（公開）
 */
@Injectable()
export class StoreCourseUseCase {
  constructor(
    private readonly courseRepo: StoreCourseRepository,
  ) {}

  /**
   * API-009: 講座一覧取得（公開）
   * x-roles: guest, all
   * ※ 認証不要（guest アクセス可）
   */
  async listPublicCourses(): Promise<CourseListResponse> {
    // TODO(TBD): Cursor実装
    // 1. Course where status=active, catalogVisibility=public_listed
    // 2. フィルタ: style, category（クエリパラメータ）
    // 3. ページネーション
    throw new Error('Not implemented');
  }

  /**
   * API-010: 講座詳細取得（公開）
   * x-roles: guest, all
   * ※ 認証不要
   */
  async getCourseDetail(courseId: string): Promise<CourseDetailView> {
    // TODO(TBD): Cursor実装
    // 1. Course 取得（status=active のみ）
    // 2. LP データ: アウトカム、前提条件、おすすめ、FAQ
    // 3. ブートキャンプの場合: CourseSection + Lesson 構造
    // 4. 講師情報: User(ownerUserId) 結合
    throw new Error('Not implemented');
  }
}
