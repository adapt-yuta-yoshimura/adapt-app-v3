// Next.js 15: searchParams は Promise型
export default async function CallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; state?: string }>;
}): Promise<React.ReactNode> {
  const { code } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">認証処理中...</p>
      {/* TODO(ADAPT): OAuth コールバック処理 */}
    </div>
  );
}
