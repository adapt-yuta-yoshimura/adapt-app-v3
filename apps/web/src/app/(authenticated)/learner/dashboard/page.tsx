// STU-UI-01 受講者ダッシュボード
import { redirect } from 'next/navigation';
import { getServerToken } from '@/lib/server-auth';
import { fetchMyCourses } from '@/lib/learner-api';
import { CourseSummaryCards } from './CourseSummaryCards';

export default async function LearnerDashboardPage() {
  const token = await getServerToken();
  if (!token) {
    redirect('/login?from=/learner/dashboard');
  }

  let items: { id: string; title: string; style: 'one_on_one' | 'seminar' | 'bootcamp' | 'lecture'; progressPercent?: number }[] = [];
  let totalCount = 0;

  try {
    const res = await fetchMyCourses(token);
    totalCount = res.items?.length ?? 0;
    items = normalizeMyCoursesItems(res.items);
  } catch {
    items = [];
  }

  return (
    <div className="p-6">
        <h1 className="text-2xl font-bold text-black">受講者ダッシュボード</h1>
        <p className="mt-1 text-sm text-grey3">STU-UI-01</p>

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-black">サマリー</h2>
          <p className="mt-1 text-sm text-grey3">受講中講座数: {totalCount}</p>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-black">受講中講座</h2>
          <CourseSummaryCards items={items} />
        </section>

        {/* TODO(TBD): 通知 API（API-004）スコープ外のため、ActivityFeed は未実装 */}
      </div>
  );
}

/**
 * GenericListResponse.items を表示用に正規化（SoT 上は object[] のため型は緩い）
 */
function normalizeMyCoursesItems(
  items: unknown[] | undefined,
): { id: string; title: string; style: 'one_on_one' | 'seminar' | 'bootcamp' | 'lecture'; progressPercent?: number }[] {
  if (!Array.isArray(items)) return [];
  const styleEnum = ['one_on_one', 'seminar', 'bootcamp', 'lecture'] as const;
  return items.map((raw) => {
    const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
    const id = typeof o.id === 'string' ? o.id : String(o.courseId ?? '');
    const title = typeof o.title === 'string' ? o.title : (o.course as { title?: string } | undefined)?.title ?? '—';
    const style = typeof o.style === 'string' && styleEnum.includes(o.style as (typeof styleEnum)[number])
      ? (o.style as (typeof styleEnum)[number])
      : 'bootcamp';
    const progressPercent = typeof o.progressPercent === 'number' ? o.progressPercent : undefined;
    return { id, title, style, progressPercent };
  }).filter((x) => x.id);
}
