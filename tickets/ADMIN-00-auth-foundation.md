# ADMIN-00: Auth基盤・共通レイアウト

## 概要
Admin画面全体の前提となる認証基盤と共通UIレイアウトを構築する。
全ドメインチケット（#1〜#5）がこのチケットに依存する。

## 画面
- **ADM-UI-01**: 運営ログイン（/login）

## ロール
- operator, root_operator

## スコープ

### Backend（API）

#### 認証基盤
- OIDC連携（auth.adapt-co.io / Keycloak）
- JWT検証・デコード
- AuthGuard（全Admin APIに適用）
- RolesGuard（x-roles に基づくロールチェック）
- @CurrentUser() デコレータ（JWTからUser情報を取得）

#### 共通サービス
- `common/auth/jwt-token.service.ts`: JWT署名・検証
- `common/auth/jwt.types.ts`: JWT関連型定義
- PrismaService（DB接続）

#### DB参照テーブル
- User（globalRole で operator/root_operator 判定）
- OAuthIdentity（OIDC連携）

#### 認証フロー（SoT準拠）
```
1. Admin画面（/login）→ auth.adapt-co.io へOIDCリダイレクト
2. Keycloakで認証（Google OAuth or パスワード）
3. コールバック → JWT（Bearer Token）取得
4. 以降のAPI呼び出しはAuthorization: Bearer {token}
5. AuthGuard: JWT検証 → User取得
6. RolesGuard: User.globalRole ∈ [operator, root_operator] を確認
```

#### 権限チェックパターン（.cursorrules §9.3 準拠）
```typescript
// Admin API は User.globalRole で判定
const user = await this.userRepo.findById(userId);
if (!user || !['operator', 'root_operator'].includes(user.globalRole)) {
  throw new ForbiddenException('Operator role required');
}
```

### Frontend（Admin App）

#### ADM-UI-01: 運営ログイン
- **Path**: /login
- **機能**: auth.adapt-co.io へのOIDCリダイレクト型ログイン
- **Figma**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8343-19&m=dev
- **動作**: ログインボタン押下 → OIDCリダイレクト → 認証後 /admin/dashboard へ遷移
- **非認証時**: 全ページで未認証の場合は /login へリダイレクト

#### AdminLayout（共通レイアウト）
- サイドバー: 幅240px、背景 #0F172A（ダークネイビー）、固定配置
- ヘッダー: 高さ56px、白背景、パンくず + アバター
- コンテンツ: padding 24px、背景 #F8FAFC
- サイドバーナビゲーション項目（SoT 07_画面一覧 admin ドメイン準拠）:
  - ダッシュボード → /admin/dashboard
  - 受講者管理 → /admin/learners
  - 講師管理 → /admin/instructors
  - 運営スタッフ → /admin/operators（root_operator のみ表示）
  - 講座管理 → /admin/courses
  - 売上・決済 → /admin/finance/overview
- アクティブ状態: 現在のパスに基づくハイライト

#### 共通コンポーネント（他チケットで再利用）
- AdminTable: shadcn/ui Table + ヘッダークリックソート + ページネーション
- StatusBadge: SoT Enum値に対応した色分けバッジ
- FilterBar: 検索 + ステータスフィルター
- ConfirmDialog: shadcn/ui Dialog ベースの確認ダイアログ

#### 技術要件
- Next.js 15 App Router（apps/admin/）
- Tailwind CSS + shadcn/ui
- lucide-react（アイコン）
- Noto Sans JP（フォント）
- TanStack Query（API呼び出し）
- OpenAPI生成型: `@adapt/types/openapi-admin`

## 実装手順

### Backend
1. `common/auth/` に JwtTokenService・型定義を作成
2. AuthGuard 実装（JWT検証 → User取得）
3. RolesGuard 実装（x-roles ベースのロールチェック）
4. @CurrentUser() デコレータ作成
5. PrismaService 作成
6. テスト（認証成功/失敗、ロール許可/拒否）

### Frontend
1. Next.js 15 Admin App 初期化（apps/admin/）
2. OIDC連携設定（auth.adapt-co.io）
3. AdminLayout 実装（サイドバー + ヘッダー + コンテンツ枠）
4. ADM-UI-01 ログイン画面実装
5. 認証ミドルウェア（未認証 → /login リダイレクト）
6. 共通コンポーネント（AdminTable / StatusBadge / FilterBar / ConfirmDialog）
7. APIクライアント基盤（TanStack Query + OpenAPI型）

## 受け入れ基準
- [ ] OIDC認証フローが動作する
- [ ] operator/root_operator でログイン可能
- [ ] learner/instructor/guest でログイン不可（403）
- [ ] JWT期限切れ時に /login へリダイレクト
- [ ] AdminLayout が全ページで共通表示される
- [ ] サイドバーナビゲーションが正しく動作する
- [ ] root_operator 限定メニューが operator に非表示
- [ ] 共通コンポーネントが他チケットから利用可能
- [ ] テスト全通過

## 依存
- なし（最初に実装する）

## ブロッカー/TBD
- OIDC設定の具体的なclient_id/secret等はインフラ側で決定（環境変数）
- Keycloakの具体的なRealm設定は別途
