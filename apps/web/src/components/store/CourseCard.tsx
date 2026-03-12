import type { components } from '@adapt/types/openapi-app';
import Link from 'next/link';
import { StyleBadge } from './StyleBadge';
import { PriceDisplay } from './PriceDisplay';

export type Course = components['schemas']['Course'];
export type CourseSummaryView = components['schemas']['CourseSummaryView'];

/** スタイル別の日時表示用テキスト（API で返る場合は上書き） */
function formatScheduleText(
  style: Course['style'],
  options?: { scheduleText?: string; durationMinutes?: number; startAt?: string }
): string {
  if (options?.scheduleText) return options.scheduleText;
  if (style === 'one_on_one' && options?.durationMinutes) return `${options.durationMinutes}min`;
  if (style === 'seminar' && options?.startAt) return options.startAt;
  if (style === 'bootcamp' && options?.startAt) return `${options.startAt}〜`;
  return '—';
}

export interface CourseCardProps {
  course: Course;
  channelCount: number;
  memberCount: number;
  priceYen?: number;
  scheduleText?: string;
  durationMinutes?: number;
  ownerDisplayName?: string;
  ownerAvatarUrl?: string | null;
  thumbnailUrl?: string | null;
}

export function CourseCard({
  course,
  channelCount,
  memberCount,
  priceYen = 0,
  scheduleText,
  durationMinutes,
  ownerDisplayName,
  ownerAvatarUrl,
  thumbnailUrl,
}: CourseCardProps) {
  const dateText = formatScheduleText(course.style, {
    scheduleText,
    durationMinutes,
    startAt: scheduleText,
  });

  return (
    <Link
      href={`/store/courses/${course.id}`}
      className="block overflow-hidden rounded-lg border border-iris-60 bg-white shadow-sm transition hover:border-iris-80 hover:shadow"
    >
      <div className="aspect-[266/150] w-full bg-iris-light">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-grey3 text-sm">
            画像なし
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-medium text-black">
          {course.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StyleBadge style={course.style} />
          <PriceDisplay amount={priceYen} />
        </div>
        <p className="mt-2 text-xs text-grey3">{dateText}</p>
        {(ownerDisplayName ?? course.ownerUserId) && (
          <div className="mt-3 flex items-center gap-2 border-t border-iris-60 pt-3">
            {ownerAvatarUrl ? (
              <img
                src={ownerAvatarUrl}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-iris-60 text-xs font-medium text-white">
                {(ownerDisplayName ?? course.ownerUserId).charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-black">
              {ownerDisplayName ?? `講師`}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
