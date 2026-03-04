# ADMIN-03: 運営スタッフ管理

## 概要
運営スタッフ（operator/root_operator）の一覧、招待、編集、削除を実装する。
root_operator 専用機能。

## 画面
- **ADM-UI-07**: 運営スタッフ一覧（/admin/operators）
- **ADM-UI-08**: 運営スタッフ招待（/admin/operators/new）
- **ADM-UI-09**: 運営スタッフ編集（/admin/operators/[userId]）

## ロール
- root_operator のみ（operator はアクセス不可）

## API一覧

| API ID | Method | Path | Summary | x-roles | x-policy |
|--------|--------|------|---------|---------|----------|
| API-ADMIN-15 | GET | /api/v1/admin/operators | 運営スタッフ一覧 | root_operator | - |
| API-ADMIN-16 | POST | /api/v1/admin/operators | 運営スタッフ招待 | root_operator | AUDIT_LOG |
| API-ADMIN-17 | PATCH | /api/v1/admin/operators/{userId} | 運営スタッフ編集 | root_operator | AUDIT_LOG |
| API-ADMIN-18 | DELETE | /api/v1/admin/operators/{userId} | 運営スタッフ削除 | root_operator | AUDIT_LOG |

## スコープ

### Backend（API）

#### API-ADMIN-15: GET /api/v1/admin/operators
- **Response**: OperatorListResponse（items: OperatorAdminView[], meta: ListMeta）
- **OperatorAdminView**: { id, email?, name?, globalRole: operator|root_operator, isActive, createdAt, updatedAt }
- **DB**: User（globalRole ∈ [operator, root_operator] でフィルタ）

#### API-ADMIN-16: POST /api/v1/admin/operators
- **Request**: OperatorInviteRequest（email, name, globalRole: operator|root_operator）
- **Response**: 201 OperatorAdminView / 409
- **処理**: Keycloakユーザー作成 → パスワード設定リンク付き招待メール送信
- **x-policy**: AUDIT_LOG
- **DB**: User, AuditEvent

#### API-ADMIN-17: PATCH /api/v1/admin/operators/{userId}
- **Request**: OperatorUpdateRequest（globalRole の operator⇔root_operator 変更）
- **Response**: 200 OperatorAdminView / 404
- **x-policy**: AUDIT_LOG
- **DB**: User, AuditEvent（eventType: operator_role_changed）

#### API-ADMIN-18: DELETE /api/v1/admin/operators/{userId}
- **Response**: 200 SuccessResponse / 404
- **処理**: deletedAt セット + isActive=false（論理削除、globalRole は保持）
- **x-policy**: AUDIT_LOG
- **DB**: User, AuditEvent

### Frontend（Admin App）

#### ADM-UI-07: 運営スタッフ一覧
- **Path**: /admin/operators
- **Figma**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8342-14&m=dev
- **機能**:
  - スタッフ一覧テーブル（OperatorAdminView）
  - ロールバッジ（operator / root_operator）
  - 検索（名前・メール）
  - ソート、ページネーション
  - 「スタッフを招待」ボタン → ADM-UI-08 へ遷移
- **API**: API-ADMIN-15
- **アクセス制限**: root_operator のみ（operator は403 or サイドバー非表示）

#### ADM-UI-08: 運営スタッフ招待
- **Path**: /admin/operators/new
- **Figma**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8346-15&m=dev
- **機能**:
  - 招待フォーム（email, name, globalRole セレクト）
  - globalRole 選択肢: operator / root_operator
  - 送信 → API-ADMIN-16
  - 成功時: スタッフ一覧へリダイレクト
  - 409エラー: メールアドレス重複メッセージ
- **API**: API-ADMIN-16

#### ADM-UI-09: 運営スタッフ編集
- **Path**: /admin/operators/[userId]
- **Figma**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8347-15&m=dev
- **機能**:
  - スタッフ詳細表示
  - ロール変更（operator ⇔ root_operator）
  - 削除（確認ダイアログ付き、API-ADMIN-18）
  - 自分自身の削除は警告表示
- **API**: API-ADMIN-15（取得）、API-ADMIN-17（編集）、API-ADMIN-18（削除）

## DB参照テーブル
- User（globalRole ∈ [operator, root_operator]）
- AuditEvent（AUDIT_LOG 記録）

## 実装手順

### Backend
1. AdminOperatorController（API-ADMIN-15〜18 の4エンドポイント）
2. AdminOperatorUseCase（一覧/招待/編集/削除）
3. UserRepository の拡張（findOperators / findOperatorById）
4. AuditEventRepository の利用
5. テスト（正常系 + 権限NG: operator拒否 + 409 Conflict）

### Frontend
1. 運営スタッフ一覧ページ（/admin/operators）
2. 運営スタッフ招待ページ（/admin/operators/new）
3. 運営スタッフ編集ページ（/admin/operators/[userId]）
4. ロールバッジコンポーネント（operator / root_operator）
5. 削除確認ダイアログ

## 受け入れ基準
- [ ] API-ADMIN-15〜18 が OpenAPI仕様と完全一致
- [ ] root_operator のみアクセス可（operator は403）
- [ ] 招待: メール送信成功 / 409エラーハンドリング
- [ ] ロール変更: operator ⇔ root_operator の双方向変更
- [ ] 削除: 論理削除（deletedAt + isActive=false）
- [ ] 全AUDIT_LOG対象操作で監査ログ記録
- [ ] サイドバーの「運営スタッフ」がroot_operatorのみに表示
- [ ] テスト全通過

## 依存
- ADMIN-00（Auth基盤・共通レイアウト・共通コンポーネント）
