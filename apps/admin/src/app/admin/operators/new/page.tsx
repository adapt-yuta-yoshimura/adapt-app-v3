/**
 * ADM-UI-08: 運営スタッフ招待
 *
 * - Path: /admin/operators/new
 * - Figma: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8346-15&m=dev
 * - ロール: root_operator のみ
 * - API: API-ADMIN-16
 *
 * ADMIN-03チケット参照
 */
export default function NewOperatorPage() {
  // TODO(TBD): Cursor実装
  // - 招待フォーム（email, name, globalRole セレクト）
  // - globalRole 選択肢: operator / root_operator
  // - 送信 → API-ADMIN-16
  // - 成功時: スタッフ一覧へリダイレクト
  // - 409エラー: メールアドレス重複メッセージ
  return (
    <div>
      <h1>運営スタッフ招待</h1>
      {/* TODO(TBD): Cursor実装 */}
    </div>
  );
}
