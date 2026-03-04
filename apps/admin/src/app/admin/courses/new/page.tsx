'use client';

/**
 * ADM-UI-11: 講座代理作成
 *
 * - Path: /admin/courses/new
 * - Figma: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8354-2&m=dev
 * - ロール: operator, root_operator
 * - API: API-ADMIN-02（作成）、API-ADMIN-09（講師候補の検索用）
 *
 * ADMIN-04チケット参照
 */

import { CourseCreateForm } from '@/components/features/course/course-create-form';

export default function NewCoursePage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-text">講座代理作成</h1>
      <CourseCreateForm />
    </div>
  );
}
