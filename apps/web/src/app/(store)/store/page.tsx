// Next.js 15: searchParams は Promise型
export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}): Promise<React.ReactNode> {
  const { category, q } = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold">ストア</h1>
      {q && <p className="mt-2 text-gray-600">検索: {q}</p>}
      {category && <p className="mt-1 text-gray-500">カテゴリ: {category}</p>}
      {/* TODO(ADAPT): ストア実装 */}
    </div>
  );
}
