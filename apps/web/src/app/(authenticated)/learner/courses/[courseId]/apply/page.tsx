// STU-UI-04 講座申込み
import { notFound } from 'next/navigation';
import { getStoreCourseDetail } from '@/lib/store-api';
import type { components } from '@adapt/types/openapi-app';
import { Breadcrumb } from '@/components/store';
import { ApplyPageContent } from './ApplyPageContent';

type Course = components['schemas']['Course'];
const STYLE_LABELS: Record<Course['style'], string> = {
  one_on_one: '1on1',
  seminar: 'セミナー',
  bootcamp: 'ブートキャンプ',
  lecture: 'レクチャー',
};

type PageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseApplyPage({ params }: PageProps) {
  const { courseId } = await params;
  let detail: Record<string, unknown>;
  try {
    detail = await getStoreCourseDetail(courseId);
  } catch {
    notFound();
  }

  const course = detail.course as Course | undefined;
  if (!course?.id || !course?.title) notFound();

  const scheduleText = detail.scheduleText as string | undefined;
  const priceYen = (detail.priceYen as number) ?? (detail.course as Record<string, unknown>)?.priceYen as number | undefined;
  const ownerDisplayName = detail.ownerDisplayName as string | undefined;

  return (
    <div className="min-h-screen bg-body">
      <div className="mx-auto max-w-2xl px-6 py-4">
        <Breadcrumb
          items={[
            { label: 'TOP', href: '/store' },
            { label: course.title, href: `/store/courses/${courseId}` },
            { label: '申し込み・予約' },
          ]}
        />
      </div>
      <ApplyPageContent
        courseId={courseId}
        courseTitle={course.title}
        scheduleText={scheduleText}
        styleLabel={STYLE_LABELS[course.style]}
        priceYen={priceYen}
        ownerDisplayName={ownerDisplayName}
      />
    </div>
  );
}
