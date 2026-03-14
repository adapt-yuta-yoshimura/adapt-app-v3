/**
 * 受講者向け API クライアント（Server Component 用）
 * API-013, 014, 015, 016, 020 を呼び出す。
 * 呼び出し元で getServerToken() を渡すこと。
 */
import type { paths } from '@adapt/types/openapi-app';
import { getApiBaseUrl } from './api-base-url';

type GetMyCoursesResponse =
  paths['/api/v1/learner/courses']['get']['responses']['200']['content']['application/json'];
type GetCourseDetailResponse =
  paths['/api/v1/learner/courses/{courseId}']['get']['responses']['200']['content']['application/json'];
type GetEnrollmentResponse =
  paths['/api/v1/learner/enrollments/{enrollmentId}']['get']['responses']['200']['content']['application/json'];
type GetRecordsResponse =
  paths['/api/v1/learner/records']['get']['responses']['200']['content']['application/json'];

export class LearnerApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'LearnerApiError';
    Object.setPrototypeOf(this, LearnerApiError.prototype);
  }
}

function getHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

const base = () => getApiBaseUrl();

/**
 * API-013: マイ講座一覧
 */
export async function fetchMyCourses(token: string | null): Promise<GetMyCoursesResponse> {
  const res = await fetch(`${base()}/api/v1/learner/courses`, {
    headers: getHeaders(token),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new LearnerApiError(`API-013 failed: ${res.status}`, res.status);
  }
  return res.json();
}

/**
 * API-014: 受講中講座詳細（423 の場合は throw せず statusCode で判定）
 */
export async function fetchCourseDetail(
  token: string | null,
  courseId: string,
): Promise<{ data?: GetCourseDetailResponse; statusCode: number }> {
  const res = await fetch(`${base()}/api/v1/learner/courses/${encodeURIComponent(courseId)}`, {
    headers: getHeaders(token),
    cache: 'no-store',
  });
  if (res.status === 423) {
    return { statusCode: 423 };
  }
  if (res.status === 404) {
    return { statusCode: 404 };
  }
  if (!res.ok) {
    throw new LearnerApiError(`API-014 failed: ${res.status}`, res.status);
  }
  const data = (await res.json()) as GetCourseDetailResponse;
  return { data, statusCode: 200 };
}

/**
 * API-015: 決済/申込状況確認（pending → active 確認用）
 */
export async function fetchEnrollment(
  token: string | null,
  enrollmentId: string,
): Promise<GetEnrollmentResponse> {
  const res = await fetch(
    `${base()}/api/v1/learner/enrollments/${encodeURIComponent(enrollmentId)}`,
    {
      headers: getHeaders(token),
      cache: 'no-store',
    },
  );
  if (!res.ok) {
    throw new LearnerApiError(`API-015 failed: ${res.status}`, res.status);
  }
  return res.json();
}

/**
 * API-020: 学習実績取得
 */
export async function fetchRecords(token: string | null): Promise<GetRecordsResponse> {
  const res = await fetch(`${base()}/api/v1/learner/records`, {
    headers: getHeaders(token),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new LearnerApiError(`API-020 failed: ${res.status}`, res.status);
  }
  return res.json();
}
