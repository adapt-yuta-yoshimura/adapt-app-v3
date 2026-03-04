# ADMIN-01: ダッシュボード

## 概要
運営者向けダッシュボード画面を構築する。

## 画面
- **ADM-UI-02**: 運営ダッシュボード（/admin/dashboard）

## ロール
- operator, root_operator

## スコープ

### Backend（API）

#### TODO(TBD): ダッシュボード集計API未定義
openapi_admin.yaml にダッシュボード集計用のAPIエンドポイントが存在しない。
07_画面一覧には「サマリー、最近のアクティビティ、通知」と記載があるが、
対応する API-ADMIN-xx が未定義のため、Backend実装はSoT更新待ち。

**§8（質問条件）該当**: SoTにAPIが存在しない画面

#### 暫定対応案（SoT更新後に正式実装）
既存APIを組み合わせてダッシュボードデータを構成する場合：
- API-ADMIN-01（全講座一覧）→ 講座数サマリー
- API-ADMIN-09（全ユーザー一覧）→ ユーザー数サマリー
- API-ADMIN-19（決済一覧）→ 売上サマリー

ただし、専用の集計APIなしでは各一覧APIを呼んで集計する非効率な実装になる。
**SoTに集計API（例: API-ADMIN-22 GET /api/v1/admin/dashboard）を追加するか要確認。**

### Frontend（Admin App）

#### ADM-UI-02: 運営ダッシュボード
- **Path**: /admin/dashboard
- **Figma**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8352-3&m=dev
- **機能**:
  - KPIサマリーカード（ユーザー数、講座数、月間売上、アクティブ受講者数）
  - 売上推移チャート
  - 最近のアクティビティリスト
- **データソース**: TODO(TBD) - 集計API定義待ち

## 実装手順
1. Frontend: ダッシュボードページ枠の作成（/admin/dashboard）
2. Frontend: KPIカードコンポーネント
3. Frontend: チャートコンポーネント（recharts等）
4. Backend: TODO(TBD) - 集計API定義後に実装

## 受け入れ基準
- [ ] /admin/dashboard にアクセス可能
- [ ] AdminLayout 内に正しく表示される
- [ ] TODO(TBD): 集計APIからのデータ表示

## 依存
- ADMIN-00（Auth基盤・共通レイアウト）

## ブロッカー/TBD
- **ダッシュボード集計API（API-ADMIN-xx）がSoTに未定義**
- 集計APIの追加を検討するか、既存API組み合わせで対応するか要決定
