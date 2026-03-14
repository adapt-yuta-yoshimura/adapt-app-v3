'use client';

/**
 * 学習実績一覧（API-020 GenericListResponse）
 * items は object[] のため、表示可能なキーを抽出して表示する。
 */
export interface RecordListProps {
  items: unknown[];
  meta?: {
    page?: { page: number; pageSize: number; total?: number | null };
    cursor?: { hasMore: boolean };
  };
}

export function RecordList({ items, meta }: RecordListProps) {
  const total = meta?.page?.total ?? items.length;

  return (
    <section className="mt-6">
      {items.length === 0 ? (
        <p className="rounded-lg border border-iris-60 bg-white p-6 text-sm text-grey3">
          実績はまだありません
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((raw, i) => (
              <CompletedCourseCard key={i} record={raw} />
            ))}
          </ul>
          {total > 0 && (
            <p className="mt-4 text-xs text-grey3">全 {total} 件</p>
          )}
        </>
      )}
    </section>
  );
}

function CompletedCourseCard({ record }: { record: unknown }) {
  const o = record && typeof record === 'object' ? (record as Record<string, unknown>) : {};
  const title = typeof o.title === 'string' ? o.title : (o.courseTitle as string) ?? (o.course as { title?: string })?.title ?? '—';
  const completedAt = typeof o.completedAt === 'string' ? o.completedAt : (o.finishedAt as string) ?? (o.updatedAt as string);

  return (
    <li className="rounded-lg border border-iris-60 bg-white p-4">
      <h3 className="text-sm font-medium text-black">{title}</h3>
      {completedAt && (
        <p className="mt-1 text-xs text-grey3">
          修了: {formatDate(completedAt)}
        </p>
      )}
    </li>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}
