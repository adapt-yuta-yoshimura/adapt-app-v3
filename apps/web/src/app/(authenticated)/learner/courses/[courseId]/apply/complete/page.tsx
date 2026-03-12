// Stripe Checkout 完了（callback: ?session_id=xxx）
import Link from 'next/link';
import { Breadcrumb } from '@/components/store';

type PageProps = {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

export default async function ApplyCompletePage({ params, searchParams }: PageProps) {
  const { courseId } = await params;
  const { session_id } = await searchParams;

  return (
    <div className="min-h-screen bg-body">
      <div className="mx-auto max-w-2xl px-6 py-4">
        <Breadcrumb
          items={[
            { label: 'TOP', href: '/store' },
            { label: '申し込み完了' },
          ]}
        />
      </div>
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <h1 className="text-xl font-bold text-black">申し込みが完了しました</h1>
        <p className="mt-4 text-grey3">
          {session_id ? 'お支払いが完了しました。' : '処理が完了しました。'}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href={`/learner/courses/${courseId}`}
            className="rounded bg-iris-100 px-6 py-3 text-sm font-medium text-white hover:bg-iris-80"
          >
            講座ページへ
          </Link>
          <Link
            href="/store"
            className="rounded border border-iris-60 px-6 py-3 text-sm font-medium text-black"
          >
            ストアトップへ
          </Link>
        </div>
      </div>
    </div>
  );
}
