import type { paths } from '@adapt/types/openapi-app';
import { apiFetch } from './api-client';

type InstructorCourseCreateBody =
  paths['/api/v1/instructor/courses']['post']['requestBody']['content']['application/json'];
type CourseDetailView =
  paths['/api/v1/instructor/courses/{courseId}']['get']['responses']['200']['content']['application/json'];
type SyllabusView =
  paths['/api/v1/instructor/courses/{courseId}/syllabus']['get']['responses']['200']['content']['application/json'];
type LessonDetailView =
  paths['/api/v1/instructor/lessons/{lessonId}']['get']['responses']['200']['content']['application/json'];

/**
 * API-026: 講座新規作成
 */
export async function createInstructorCourse(
  body: InstructorCourseCreateBody,
  token?: string,
): Promise<CourseDetailView> {
  return apiFetch<CourseDetailView>('/api/v1/instructor/courses', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(body),
  });
}

/**
 * API-030: 承認申請
 */
export async function requestApproval(
  courseId: string,
  token?: string,
): Promise<CourseDetailView> {
  return apiFetch<CourseDetailView>(
    `/api/v1/instructor/courses/${courseId}/request-approval`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify({}),
    },
  );
}

/**
 * API-031: コース公開（範囲限定公開）
 */
export async function publishCourse(
  courseId: string,
  token?: string,
): Promise<CourseDetailView> {
  return apiFetch<CourseDetailView>(
    `/api/v1/instructor/courses/${courseId}/publish`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );
}

/**
 * API-027: 講座詳細取得(管理)
 */
export async function getInstructorCourse(
  courseId: string,
  token?: string,
): Promise<CourseDetailView> {
  return apiFetch<CourseDetailView>(
    `/api/v1/instructor/courses/${courseId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );
}

/**
 * API-034: シラバス構造取得
 */
export async function getSyllabus(
  courseId: string,
  token?: string,
): Promise<SyllabusView> {
  return apiFetch<SyllabusView>(
    `/api/v1/instructor/courses/${courseId}/syllabus`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );
}

/**
 * API-035: セクション追加
 */
export async function createSection(
  courseId: string,
  body: Record<string, unknown>,
  token?: string,
): Promise<SyllabusView> {
  return apiFetch<SyllabusView>(
    `/api/v1/instructor/courses/${courseId}/sections`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify(body),
    },
  );
}

/**
 * API-036: セクション編集
 */
export async function updateSection(
  sectionId: string,
  body: Record<string, unknown>,
  token?: string,
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(
    `/api/v1/instructor/sections/${sectionId}`,
    {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify(body),
    },
  );
}

/**
 * API-037: セクション削除
 */
export async function deleteSection(
  sectionId: string,
  token?: string,
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(
    `/api/v1/instructor/sections/${sectionId}`,
    {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );
}

/**
 * API-038: レッスン作成
 */
export async function createLesson(
  sectionId: string,
  body: Record<string, unknown>,
  token?: string,
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(
    `/api/v1/instructor/sections/${sectionId}/lessons`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify(body),
    },
  );
}

/**
 * API-039: レッスン詳細取得
 */
export async function getLesson(
  lessonId: string,
  token?: string,
): Promise<LessonDetailView> {
  return apiFetch<LessonDetailView>(
    `/api/v1/instructor/lessons/${lessonId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );
}

/**
 * API-040: レッスン編集
 */
export async function updateLesson(
  lessonId: string,
  body: Record<string, unknown>,
  token?: string,
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(
    `/api/v1/instructor/lessons/${lessonId}`,
    {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify(body),
    },
  );
}

/**
 * API-041: レッスン削除
 */
export async function deleteLesson(
  lessonId: string,
  token?: string,
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(
    `/api/v1/instructor/lessons/${lessonId}`,
    {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );
}
