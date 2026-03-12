// LearnerLayout — 受講者向け共通レイアウト
export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* TODO(TBD): Cursor実装 — サイドバー + ヘッダー */}
      <main>{children}</main>
    </div>
  );
}
