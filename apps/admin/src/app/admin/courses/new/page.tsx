/**
 * ADM-UI-11: 講座代理作成
 *
 * - Path: /admin/courses/new
 * - Figma: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8354-2&m=dev
 * - ロール: operator, root_operator
 * - API: API-ADMIN-02（作成）、API-ADMIN-09（講師候補の検索用）
 *
 * ADMIN-04チケット参照
 */
export default function NewCoursePage() {
  // TODO(TBD): Cursor実装
  // - 作成フォーム（AdminCourseCreateRequest）
  // - title（必須）、style（必須）、ownerUserId（必須・講師選択）
  // - description、catalogVisibility、visibility（任意）
  // - ownerUserId: 講師検索で指定（API-ADMIN-09 で instructor 一覧を取得）
  // - 送信 → API-ADMIN-02
  // - 成功時: 講座一覧へリダイレクト
  return (
    <div>
      <h1>講座代理作成</h1>
      {/* TODO(TBD): Cursor実装 */}
    </div>
  );
}
