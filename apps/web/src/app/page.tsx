import Link from 'next/link';

export default function HomePage(): React.ReactNode {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">adapt</h1>
      <p className="mt-4 text-gray-600">学習プラットフォーム</p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
        >
          ログイン
        </Link>
        <Link
          href="/signup"
          className="rounded-md border border-gray-300 px-6 py-3 hover:bg-gray-50"
        >
          新規登録
        </Link>
      </div>
    </main>
  );
}
