# ADMIN-05: 決済管理

## 概要
決済履歴の一覧表示・フィルタ・集計を実装する。

## 画面
- **ADM-UI-14**: 売上・決済管理（/admin/finance/overview）

## ロール
- operator, root_operator

## API一覧

| API ID | Method | Path | Summary | x-roles | x-policy |
|--------|--------|------|---------|---------|----------|
| API-ADMIN-19 | GET | /api/v1/admin/payments | 決済履歴一覧 | operator, root_operator | - |

## スコープ

### Backend（API）

#### API-ADMIN-19: GET /api/v1/admin/payments
- **Response**: PaymentListResponse（items: PaymentSummaryView[], meta: ListMeta）
- **PaymentSummaryView**:
  - id: string (required)
  - userId: string (required)
  - userName: string (required)
  - courseId: string?
  - courseTitle: string?
  - amount: integer (required)
  - currency: string (required)
  - status: PaymentStatus (required) → pending | succeeded | failed | canceled | refunded
  - provider: PaymentProvider (required) → stripe | manual
  - createdAt: datetime (required)
- **DB**: Order（Payment情報）、User（userName）、Course（courseTitle）

### Frontend（Admin App）

#### ADM-UI-14: 売上・決済管理
- **Path**: /admin/finance/overview
- **Figma**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8357-3&m=dev
- **機能**:
  - KPIカード4枚（総売上、月間売上、決済件数、返金件数）
  - 決済一覧テーブル（PaymentSummaryView）
  - フィルター:
    - 検索（ユーザー名・講座名）
    - ステータス: pending / succeeded / failed / canceled / refunded
    - プロバイダー: stripe / manual
  - 全カラムソート
  - ページネーション
  - PaymentStatusBadge: pending(黄) / succeeded(緑) / failed(赤) / canceled(灰) / refunded(青)
  - ProviderBadge: stripe(紫) / manual(灰)
- **API**: API-ADMIN-19

## DB参照テーブル
- Order（amount, currency, status, paymentProvider）
- User（userName 結合）
- Course（courseTitle 結合）

## 実装手順

### Backend
1. AdminPaymentController（API-ADMIN-19）
2. AdminPaymentUseCase（一覧取得 + User/Course結合）
3. OrderRepository（findMany with User/Course join）
4. テスト（正常系 + 権限NG）

### Frontend
1. 売上・決済管理ページ（/admin/finance/overview）
2. KPIカードコンポーネント（集計表示）
3. PaymentStatusBadge / ProviderBadge
4. フィルターバー（検索 + ステータス + プロバイダー）

## 受け入れ基準
- [ ] API-ADMIN-19 が OpenAPI仕様と完全一致
- [ ] PaymentSummaryView に userName(required) / courseTitle(nullable) が含まれる
- [ ] KPIカード: 集計値が正しく表示
- [ ] フィルター: ステータス5値 + プロバイダー2値が動作
- [ ] バッジ: PaymentStatus / PaymentProvider の色分けが正しい
- [ ] ソート: 全カラム対応
- [ ] ページネーション: 件数セレクタ(5/10/50/100) + ページ送り
- [ ] 権限チェック: operator, root_operator のみアクセス可
- [ ] テスト全通過

## 依存
- ADMIN-00（Auth基盤・共通レイアウト・共通コンポーネント）
