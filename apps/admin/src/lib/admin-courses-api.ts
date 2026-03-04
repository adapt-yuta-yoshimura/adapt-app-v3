/**
 * ADMIN-04: 講座管理 API クライアント
 *
 * SoT: openapi_admin.yaml - API-ADMIN-01〜08
 *
 * TODO(TBD): pnpm generate:types 実行後、OpenAPI 生成型に置換
 */

import { adminApiFetch } from './api-client';

// ---------------------------------------------------------------------------
// 型定義（OpenAPI 準拠・手動定義）
// TODO(TBD): OpenAPI 生成型に置換
// ---------------------------------------------------------------------------

/** CourseStatus enum（SoT: schema.prisma） */
export type CourseStatus = 'draft' | 'pending_approval' | 'active' | 'archived';

/** CourseStyle enum（SoT: schema.prisma） */
export type CourseStyle = 'one_on_one' | 'seminar' | 'bootcamp' | 'lecture';

/** CourseCatalogVisibility enum（SoT: schema.prisma） */
export type CourseCatalogVisibility =
  | 'public_listed'
  | 'public_unlisted'
  | 'private';

/** CourseVisibility enum（SoT: schema.prisma） */
export type CourseVisibility = 'public' | 'instructors_only';

/** Course（SoT: openapi_admin.yaml - Course schema） */
export type CourseAdminView = {
  id: string;
  title: string;
  description: string | null;
  ownerUserId: string;
  createdByUserId: string;
  status: CourseStatus;
  style: CourseStyle;
  catalogVisibility: CourseCatalogVisibility;
  visibility: CourseVisibility;
  isFrozen: boolean;
  frozenAt: string | null;
  frozenByUserId: string | null;
  freezeReason: string | null;
  approvalRequestedAt: string | null;
  approvedAt: string | null;
  approvedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

/** ListMeta（ページネーション情報） */
export type ListMeta = {
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
};

/** CourseListResponse（SoT: openapi_admin.yaml） */
export type CourseListResponse = {
  items: CourseAdminView[];
  meta: ListMeta;
};

/** AdminCourseCreateRequest（SoT: openapi_admin.yaml） */
export type AdminCourseCreateRequest = {
  title: string;
  style: CourseStyle;
  ownerUserId: string;
  description?: string;
  catalogVisibility?: CourseCatalogVisibility;
  visibility?: CourseVisibility;
};

/** AdminCourseUpdateRequest（SoT: openapi_admin.yaml） */
export type AdminCourseUpdateRequest = {
  title?: string;
  description?: string;
  ownerUserId?: string;
  catalogVisibility?: CourseCatalogVisibility;
  visibility?: CourseVisibility;
};

/** SuccessResponse */
export type SuccessResponse = {
  success: boolean;
  message?: string;
};

// ---------------------------------------------------------------------------
// API 定数
// ---------------------------------------------------------------------------

const COURSES_BASE = '/courses';
const AUDIT_BASE = '/audit/courses';

// ---------------------------------------------------------------------------
// API 呼び出し関数
// ---------------------------------------------------------------------------

/**
 * API-ADMIN-01: 全講座一覧
 * GET /api/v1/admin/courses
 */
export async function fetchCourseList(params?: {
  page?: number;
  perPage?: number;
  status?: string;
}): Promise<CourseListResponse> {
  const search = new URLSearchParams();
  if (params?.page !== undefined) search.set('page', String(params.page));
  if (params?.perPage !== undefined)
    search.set('perPage', String(params.perPage));
  if (params?.status) search.set('status', params.status);
  const q = search.toString();
  return adminApiFetch<CourseListResponse>(
    `${COURSES_BASE}${q ? `?${q}` : ''}`,
  );
}

/**
 * API-ADMIN-02: 講座代理作成
 * POST /api/v1/admin/courses
 */
export async function createCourse(
  body: AdminCourseCreateRequest,
): Promise<CourseAdminView> {
  return adminApiFetch<CourseAdminView>(COURSES_BASE, {
    method: 'POST',
    body,
  });
}

/**
 * API-ADMIN-03: 講座代理編集
 * PATCH /api/v1/admin/courses/{courseId}
 */
export async function updateCourse(
  courseId: string,
  body: AdminCourseUpdateRequest,
): Promise<CourseAdminView> {
  return adminApiFetch<CourseAdminView>(`${COURSES_BASE}/${courseId}`, {
    method: 'PATCH',
    body,
  });
}

/**
 * API-ADMIN-04: 講座削除（論理削除 → archived）
 * DELETE /api/v1/admin/courses/{courseId}
 */
export async function deleteCourse(
  courseId: string,
): Promise<SuccessResponse> {
  return adminApiFetch<SuccessResponse>(`${COURSES_BASE}/${courseId}`, {
    method: 'DELETE',
  });
}

/**
 * API-ADMIN-05: 講座承認
 * POST /api/v1/admin/courses/{courseId}/approve
 */
export async function approveCourse(
  courseId: string,
): Promise<CourseAdminView> {
  return adminApiFetch<CourseAdminView>(
    `${COURSES_BASE}/${courseId}/approve`,
    { method: 'POST', body: {} },
  );
}

/**
 * API-ADMIN-06: コース凍結
 * POST /api/v1/admin/courses/{courseId}/freeze
 */
export async function freezeCourse(
  courseId: string,
  reason?: string,
): Promise<CourseAdminView> {
  return adminApiFetch<CourseAdminView>(
    `${COURSES_BASE}/${courseId}/freeze`,
    { method: 'POST', body: { reason } },
  );
}

/**
 * API-ADMIN-07: コース凍結解除（root_operator のみ）
 * POST /api/v1/admin/courses/{courseId}/unfreeze
 */
export async function unfreezeCourse(
  courseId: string,
): Promise<CourseAdminView> {
  return adminApiFetch<CourseAdminView>(
    `${COURSES_BASE}/${courseId}/unfreeze`,
    { method: 'POST', body: {} },
  );
}

/**
 * API-ADMIN-08: [監査]凍結講座閲覧
 * GET /api/v1/admin/audit/courses/{courseId}
 */
export async function fetchCourseAudit(
  courseId: string,
): Promise<Record<string, unknown>> {
  return adminApiFetch<Record<string, unknown>>(
    `${AUDIT_BASE}/${courseId}`,
  );
}
