// STU-UI-10 実績・修了履歴
import { redirect } from 'next/navigation';
import { getServerToken } from '@/lib/server-auth';
import { fetchRecords } from '@/lib/learner-api';
import { RecordList } from './RecordList';

export default async function LearnerRecordsPage() {
  const token = await getServerToken();
  if (!token) {
    redirect('/login?from=/learner/records');
  }

  let items: unknown[] = [];
  let meta: { page?: { page: number; pageSize: number; total?: number | null }; cursor?: { hasMore: boolean } } | undefined;

  try {
    const res = await fetchRecords(token);
    items = Array.isArray(res.items) ? res.items : [];
    meta = res.meta as typeof meta;
  } catch {
    items = [];
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-black">実績・修了履歴</h1>
      <p className="mt-1 text-sm text-grey3">STU-UI-10</p>

      <RecordList items={items} meta={meta} />
    </div>
  );
}
