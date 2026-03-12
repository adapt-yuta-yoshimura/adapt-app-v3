// PG-001 ストアトップ
import { Suspense } from 'react';
import { getStoreCourses } from '@/lib/store-api';
import {
  StoreHero,
  CategoryTabs,
  StyleFilter,
  CourseCardGrid,
  InstructorCard,
} from '@/components/store';

/** 講師一覧セクション用（SoT 未定義のため Figma テキストをハードコード・PG-006 はスコープ外） */
const INSTRUCTOR_PLACEHOLDERS = [
  { userId: 'instructor-1', displayName: '講師 A', category: 'AI' },
  { userId: 'instructor-2', displayName: '講師 B', category: 'プロダクト開発' },
  { userId: 'instructor-3', displayName: '講師 C', category: 'デザイン' },
  { userId: 'instructor-4', displayName: '講師 D', category: 'マーケティング' },
  { userId: 'instructor-5', displayName: '講師 E', category: 'エンジニア' },
  { userId: 'instructor-6', displayName: '講師 F', category: 'ChatGPT × Excel連携' },
];

type PageProps = {
  searchParams: Promise<{ style?: string; category?: string; page?: string }>;
};

export default async function StoreTopPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const style = params.style ?? undefined;
  const category = params.category === 'すべて' ? undefined : params.category;
  const page = params.page ? Number(params.page) : 1;

  const data = await getStoreCourses({
    style,
    category,
    page: 1,
  });

  const meta = data.meta as { page?: { total?: number; pageSize?: number } } | undefined;
  const pageSize = meta?.page?.pageSize ?? 20;
  const total = meta?.page?.total ?? 0;
  const hasMore = data.items.length >= pageSize && (total === 0 || pageSize < total);

  return (
    <div className="min-h-screen bg-body">
      <StoreHero />
      <CategoryTabs />
      <StyleFilter />
      <Suspense fallback={<div className="p-8 text-grey3">読み込み中…</div>}>
        <CourseCardGrid
          key={`${style ?? ''}-${category ?? ''}`}
          initialItems={data.items}
          style={params.style ?? null}
          category={params.category ?? null}
          initialHasMore={hasMore}
        />
      </Suspense>

      <section className="border-t border-iris-60 bg-white px-6 py-10" aria-label="講師一覧">
        <h2 className="mx-auto max-w-7xl text-lg font-bold text-black">講師一覧</h2>
        <div className="mx-auto mt-6 grid max-w-7xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3">
          {INSTRUCTOR_PLACEHOLDERS.map((instructor) => (
            <InstructorCard
              key={instructor.userId}
              userId={instructor.userId}
              displayName={instructor.displayName}
              category={instructor.category}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
