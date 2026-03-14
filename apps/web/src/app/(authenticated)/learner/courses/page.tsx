// STU-UI-02 マイ講座一覧
import { redirect } from 'next/navigation';
import { getServerToken } from '@/lib/server-auth';
import { fetchMyCourses } from '@/lib/learner-api';
import { CourseListView } from './CourseListView';

export default async function LearnerCoursesPage() {
  const token = await getServerToken();
  if (!token) {
    redirect('/login?from=/learner/courses');
  }

  let items: { id: string; title: string; style: 'one_on_one' | 'seminar' | 'bootcamp' | 'lecture'; progressPercent?: number }[] = [];
  let meta: { page?: { page: number; pageSize: number; total?: number | null }; cursor?: { nextCursor?: string | null; hasMore: boolean } } | undefined;

  try {
    const res = await fetchMyCourses(token);
    items = normalizeMyCoursesItems(res.items);
    meta = res.meta as typeof meta;
  } catch {
    items = [];
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-black">マイ講座一覧</h1>
      <p className="mt-1 text-sm text-grey3">STU-UI-02</p>

      <CourseListView items={items} meta={meta} />
    </div>
  );
}

function normalizeMyCoursesItems(
  items: unknown[] | undefined,
): { id: string; title: string; style: 'one_on_one' | 'seminar' | 'bootcamp' | 'lecture'; progressPercent?: number }[] {
  if (!Array.isArray(items)) return [];
  const styleEnum = ['one_on_one', 'seminar', 'bootcamp', 'lecture'] as const;
  return items.map((raw) => {
    const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
    const id = typeof o.id === 'string' ? o.id : String(o.courseId ?? '');
    const title = typeof o.title === 'string' ? o.title : (o.course as { title?: string })?.title ?? '—';
    const style = typeof o.style === 'string' && styleEnum.includes(o.style as (typeof styleEnum)[number])
      ? (o.style as (typeof styleEnum)[number])
      : 'bootcamp';
    const progressPercent = typeof o.progressPercent === 'number' ? o.progressPercent : undefined;
    return { id, title, style, progressPercent };
  }).filter((x) => x.id);
}
