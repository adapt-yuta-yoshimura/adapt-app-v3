// PG-005 講座詳細LP
import { notFound } from 'next/navigation';
import { getStoreCourseDetail } from '@/lib/store-api';
import { getStoreCourses } from '@/lib/store-api';
import type { components } from '@adapt/types/openapi-app';
import {
  Breadcrumb,
  StyleBadge,
  PriceDisplay,
  ApplyButton,
  CourseCard,
} from '@/components/store';

type Course = components['schemas']['Course'];
type CourseStyle = Course['style'];

type PageProps = {
  params: Promise<{ courseId: string }>;
};

/** GenericDetailView から course を安全に取得 */
function getCourse(detail: Record<string, unknown>): Course | null {
  const c = detail.course;
  if (!c || typeof c !== 'object' || !('id' in c) || !('title' in c) || !('style' in c)) return null;
  return c as Course;
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { courseId } = await params;
  let detail: Record<string, unknown>;
  try {
    detail = await getStoreCourseDetail(courseId);
  } catch {
    notFound();
  }

  const course = getCourse(detail);
  if (!course) notFound();

  const style = course.style as CourseStyle;
  const priceYen = (detail.priceYen as number) ?? (detail.course as Record<string, unknown>)?.priceYen as number | undefined ?? 0;
  const scheduleText = detail.scheduleText as string | undefined;
  const ownerDisplayName = detail.ownerDisplayName as string | undefined;
  const sections = detail.sections as Array<{ title: string; lessons?: Array<{ title: string }> }> | undefined;
  const faqs = detail.faqs as Array<{ question: string; answer: string }> | undefined;

  // 関連講座（同スタイルの先頭数件・自分を除く）
  const listRes = await getStoreCourses({ style, page: 1 });
  const related = listRes.items
    .filter((item) => item.course.id !== courseId)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-body">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <Breadcrumb
          items={[
            { label: 'TOP', href: '/store' },
            { label: '講座詳細' },
          ]}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* 左カラム */}
          <div className="space-y-4">
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-iris-light">
              {(detail.thumbnailUrl as string) ? (
                <img
                  src={detail.thumbnailUrl as string}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-grey3 text-sm">
                  画像なし
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-black">{course.title}</h1>
              <div className="mt-2 flex items-center gap-2">
                <StyleBadge style={style} />
                {priceYen > 0 && <PriceDisplay amount={priceYen} />}
              </div>
              {scheduleText && (
                <p className="mt-2 text-sm text-grey3">{scheduleText}</p>
              )}
              {ownerDisplayName && (
                <p className="mt-1 text-sm text-grey3">主催: {ownerDisplayName}</p>
              )}
            </div>
            <ApplyButton courseId={courseId} />
          </div>

          {/* 右カラム */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-black">{course.title}</h2>
            {course.description && (
              <div className="prose prose-sm max-w-none">
                <p className="text-black">{course.description}</p>
              </div>
            )}
            {(detail.necessity as string) && (
              <section>
                <h3 className="text-sm font-bold text-black">この講座の必要性</h3>
                <p className="mt-1 text-sm text-grey3">{detail.necessity as string}</p>
              </section>
            )}
            {Array.isArray(detail.solutions) && (detail.solutions as string[]).length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-black">この講座で解決すること</h3>
                <ul className="mt-2 list-inside list-disc text-sm text-grey3">
                  {(detail.solutions as string[]).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </section>
            )}
            {Array.isArray(detail.prerequisites) && (detail.prerequisites as string[]).length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-black">前提条件</h3>
                <ul className="mt-2 list-inside list-disc text-sm text-grey3">
                  {(detail.prerequisites as string[]).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </section>
            )}
            {Array.isArray(detail.targetAudience) && (detail.targetAudience as string[]).length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-black">こんな方におすすめ</h3>
                <ul className="mt-2 list-inside list-disc text-sm text-grey3">
                  {(detail.targetAudience as string[]).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {/* BC のみ: シラバス */}
        {style === 'bootcamp' && sections && sections.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold text-black">シラバス</h2>
            <ul className="mt-4 space-y-2">
              {sections.map((sec, i) => (
                <li key={i} className="rounded border border-iris-60 bg-white p-4">
                  <p className="font-medium text-black">{sec.title}</p>
                  {sec.lessons && (
                    <ul className="mt-2 list-inside list-disc text-sm text-grey3">
                      {sec.lessons.map((les, j) => (
                        <li key={j}>{les.title}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* BC のみ: FAQ */}
        {style === 'bootcamp' && faqs && faqs.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold text-black">よくある質問</h2>
            <ul className="mt-4 space-y-4">
              {faqs.map((faq, i) => (
                <li key={i} className="rounded border border-iris-60 bg-white p-4">
                  <p className="font-medium text-black">Q. {faq.question}</p>
                  <p className="mt-2 text-sm text-grey3">A. {faq.answer}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 関連講座 */}
        {related.length > 0 && (
          <section className="mt-12" aria-label="関連講座">
            <h2 className="text-lg font-bold text-black">関連講座</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <CourseCard
                  key={item.course.id}
                  course={item.course}
                  channelCount={item.channelCount}
                  memberCount={item.memberCount}
                  priceYen={(item as unknown as { course?: { priceYen?: number } }).course?.priceYen ?? 0}
                  thumbnailUrl={(item.course as unknown as { thumbnailUrl?: string | null }).thumbnailUrl}
                  ownerDisplayName={(item as unknown as { ownerDisplayName?: string }).ownerDisplayName}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
