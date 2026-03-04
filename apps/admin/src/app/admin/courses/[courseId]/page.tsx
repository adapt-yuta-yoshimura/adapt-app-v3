/**
 * ADM-UI-13: 講座詳細・監査
 *
 * - Path: /admin/courses/[courseId]
 * - Figma（詳細）: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8355-2&m=dev
 * - Figma（審査パネル）: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8356-3&m=dev
 * - ロール: operator, root_operator（凍結解除は root_operator のみ）
 * - API: API-ADMIN-01（取得）、API-ADMIN-03〜08
 *
 * ADMIN-04チケット参照
 */
export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  // TODO(TBD): Cursor実装
  // - 講座詳細情報表示
  // - 審査パネル: 承認ボタン（API-ADMIN-05）
  // - 凍結/凍結解除ボタン（API-ADMIN-06/07）
  // - 削除ボタン（API-ADMIN-04、確認ダイアログ）
  // - 監査ログ表示
  // - 「編集画面へ」→ ADM-UI-12（未実装の旨を表示）
  return (
    <div>
      <h1>講座詳細</h1>
      {/* TODO(TBD): Cursor実装 - courseId: {courseId} */}
    </div>
  );
}
