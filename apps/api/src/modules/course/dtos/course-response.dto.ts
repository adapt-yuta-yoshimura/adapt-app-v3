/**
 * コースレスポンスDTO
 * @see openapi_app.yaml - Course, CourseSummaryView, CourseDetailView
 */

/** コース基本情報（OpenAPI Course スキーマに準拠） */
export interface CourseResponseDto {
  id: string;
  title: string;
  description: string | null;
  ownerUserId: string;
  createdByUserId: string;
  status: string;
  catalogVisibility: string;
  visibility: string;
  isFrozen: boolean;
  frozenAt: string | null;
  frozenByUserId: string | null;
  freezeReason: string | null;
  approvalRequestedAt: string | null;
  approvedAt: string | null;
  approvedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** コース一覧アイテム（OpenAPI CourseSummaryView に準拠） */
export interface CourseSummaryDto {
  course: CourseResponseDto;
  channelCount: number;
  memberCount: number;
  isFrozen: boolean;
}

/** コース一覧レスポンス（OpenAPI CourseListResponse に準拠） */
export interface CourseListResponseDto {
  items: CourseSummaryDto[];
  meta: {
    page?: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  };
}

/** コース詳細レスポンス（OpenAPI CourseDetailView に準拠） */
export interface CourseDetailResponseDto {
  course: CourseResponseDto;
  channels: unknown[];
  stats: {
    memberCount: number;
    channelCount: number;
  };
}
