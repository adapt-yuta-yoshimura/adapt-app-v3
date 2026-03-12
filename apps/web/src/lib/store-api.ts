import type { StoreCoursesResponse, StoreCourseDetailResponse } from '@/lib/store-api-types';
import { getApiBaseUrl } from '@/lib/api-base-url';

export interface GetStoreCoursesParams {
  style?: string;
  category?: string;
  page?: number;
}

/**
 * API-009: ストア講座一覧取得（Server Component 用）
 */
export async function getStoreCourses(
  params?: GetStoreCoursesParams
): Promise<StoreCoursesResponse> {
  const searchParams = new URLSearchParams();
  if (params?.style) searchParams.set('style', params.style);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.page != null) searchParams.set('page', String(params.page));

  const base = getApiBaseUrl();
  const url = `${base}/api/v1/store/courses${searchParams.toString() ? `?${searchParams}` : ''}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`Store courses fetch failed: ${res.status}`);
  }
  return res.json() as Promise<StoreCoursesResponse>;
}

/**
 * API-010: ストア講座詳細取得（Server Component 用）
 * GenericDetailView のため実行時バリデーションで course を取得
 */
export async function getStoreCourseDetail(
  courseId: string
): Promise<StoreCourseDetailResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/v1/store/courses/${courseId}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error('Course not found');
    throw new Error(`Store course detail fetch failed: ${res.status}`);
  }
  return res.json() as Promise<StoreCourseDetailResponse>;
}
