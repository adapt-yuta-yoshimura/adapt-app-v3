/**
 * ADM-UI-14: 売上・決済管理
 *
 * - Path: /admin/finance/overview
 * - Figma: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8357-3&m=dev
 * - ロール: operator, root_operator
 * - API: API-ADMIN-19
 *
 * ADMIN-05チケット参照
 */
export default function FinanceOverviewPage() {
  // TODO(TBD): Cursor実装
  // - KPIカード4枚（総売上、月間売上、決済件数、返金件数）
  // - 決済一覧テーブル（PaymentSummaryView）
  // - フィルター: 検索（ユーザー名・講座名）、ステータス、プロバイダー
  // - PaymentStatusBadge: pending(黄) / succeeded(緑) / failed(赤) / canceled(灰) / refunded(青)
  // - ProviderBadge: stripe(紫) / manual(灰)
  // - 全カラムソート、ページネーション
  return (
    <div>
      <h1>売上・決済管理</h1>
      {/* TODO(TBD): Cursor実装 */}
    </div>
  );
}
