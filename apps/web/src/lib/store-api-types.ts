/**
 * ストア・申込で使用する API 型（openapi_app 準拠）
 */
import type { paths } from '@adapt/types/openapi-app';

export type StoreCoursesResponse =
  paths['/api/v1/store/courses']['get']['responses']['200']['content']['application/json'];

export type StoreCourseDetailResponse =
  paths['/api/v1/store/courses/{courseId}']['get']['responses']['200']['content']['application/json'];

export type ApplyResponse =
  paths['/api/v1/store/courses/{courseId}/apply']['post']['responses']['201']['content']['application/json'];

export type CheckoutResponse =
  paths['/api/v1/payments/stripe/checkout']['post']['responses']['201']['content']['application/json'];

export type CourseSummaryView = StoreCoursesResponse['items'][number];
