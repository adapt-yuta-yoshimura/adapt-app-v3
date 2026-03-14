/**
 * CourseStyle Enum バッジ（STU 共通）
 * SoT: openapi_app.yaml CourseStyle
 */
import type { components } from '@adapt/types/openapi-app';

type CourseStyle = components['schemas']['CourseStyle'];

const STYLE_LABELS: Record<CourseStyle, string> = {
  one_on_one: '1on1',
  seminar: 'セミナー',
  bootcamp: 'ブートキャンプ',
  lecture: 'レクチャー',
};

export interface CourseStyleBadgeProps {
  style: CourseStyle;
}

export function CourseStyleBadge({ style }: CourseStyleBadgeProps) {
  const label = STYLE_LABELS[style] ?? style;
  return (
    <span className="inline-flex items-center rounded bg-iris-light px-2 py-0.5 text-xs font-medium text-iris-100">
      {label}
    </span>
  );
}
