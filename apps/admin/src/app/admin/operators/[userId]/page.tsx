/**
 * ADM-UI-09: 運営スタッフ編集
 *
 * - Path: /admin/operators/[userId]
 * - Figma: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8347-15&m=dev
 * - ロール: root_operator のみ
 * - API: API-ADMIN-15（取得）、API-ADMIN-17（編集）、API-ADMIN-18（削除）
 *
 * ADMIN-03チケット参照
 */
export default async function OperatorDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await params;
  // TODO(TBD): Cursor実装
  return (
    <div>
      <h1>運営スタッフ編集</h1>
      {/* TODO(TBD): Cursor実装 */}
    </div>
  );
}
