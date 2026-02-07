'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactNode {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">エラーが発生しました</h2>
      <p className="mt-2 text-gray-600">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
      >
        もう一度試す
      </button>
    </div>
  );
}
