'use client';

/**
 * セクション → レッスン階層表示（STU-UI-03）
 * style === 'bootcamp' の場合に表示。1on1/セミナーは sections が空配列。
 */
import type { components } from '@adapt/types/openapi-app';

type CourseSection = components['schemas']['CourseSection'];
type CourseStyle = components['schemas']['CourseStyle'];

export interface SyllabusTreeProps {
  courseId: string;
  style: CourseStyle;
  sections: CourseSection[];
}

export function SyllabusTree({ courseId, style, sections }: SyllabusTreeProps) {
  if (style !== 'bootcamp' || sections.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-iris-60 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-black">シラバス</h3>
      <ul className="space-y-3">
        {sections.map((section) => (
          <li key={section.id}>
            <div className="text-sm font-medium text-iris-100">{section.title}</div>
            <ul className="mt-1 space-y-1 pl-4">
              {(section.lessons ?? []).map((lesson) => (
                <li key={lesson.id} className="text-xs text-grey3">
                  {lesson.title}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
