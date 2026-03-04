# ADMIN-02: ユーザー管理（受講者・講師）

## 概要
受講者・講師の一覧表示、詳細閲覧、招待、編集、凍結/解除、論理削除を実装する。

## 画面
- **ADM-UI-03**: 受講者管理一覧（/admin/learners）
- **ADM-UI-04**: 受講者詳細（/admin/learners/[userId]）
- **ADM-UI-05**: 講師管理一覧（/admin/instructors）
- **ADM-UI-06**: 講師詳細（/admin/instructors/[userId]）

## ロール
- operator, root_operator

## API一覧

| API ID | Method | Path | Summary | x-roles | x-policy |
|--------|--------|------|---------|---------|----------|
| API-ADMIN-09 | GET | /api/v1/admin/users | 全ユーザー一覧 | operator, root_operator | - |
| API-ADMIN-10 | POST | /api/v1/admin/users | ユーザー招待（受講者/講師） | operator, root_operator | AUDIT_LOG |
| API-ADMIN-11 | PATCH | /api/v1/admin/users/{userId} | ユーザー編集 | operator, root_operator | AUDIT_LOG |
| API-ADMIN-12 | DELETE | /api/v1/admin/users/{userId} | ユーザー論理削除 | operator, root_operator | AUDIT_LOG |
| API-ADMIN-13 | POST | /api/v1/admin/users/{userId}/freeze | ユーザー凍結(BAN) | operator, root_operator | AUDIT_LOG |
| API-ADMIN-14 | POST | /api/v1/admin/users/{userId}/unfreeze | ユーザー凍結解除 | operator, root_operator | AUDIT_LOG |

## スコープ

### Backend（API）

#### API-ADMIN-09: GET /api/v1/admin/users
- **Response**: UserListResponse（items: UserAdminView[], meta: ListMeta）
- **UserAdminView**: { user: User, status: string, lastLoginAt: datetime? }
- **フィルタ**: globalRole, isActive, deletedAt
- **DB**: User

#### API-ADMIN-10: POST /api/v1/admin/users
- **Request**: UserInviteRequest（email, name, globalRole: learner|instructor）
- **Response**: 201 UserAdminView / 400 / 409
- **処理**: Keycloakユーザー作成 → パスワード設定リンク付き招待メール送信
- **x-policy**: AUDIT_LOG
- **DB**: User, AuditEvent
- **UI呼び出し元**: ADM-UI-03 / ADM-UI-05 のモーダルダイアログ

#### API-ADMIN-11: PATCH /api/v1/admin/users/{userId}
- **Request**: UserUpdateRequest（email?, name?, globalRole?: learner|instructor, isActive?）
- **Response**: 200 User / 404 / 409
- **x-policy**: AUDIT_LOG
- **DB**: User, AuditEvent

#### API-ADMIN-12: DELETE /api/v1/admin/users/{userId}
- **Response**: 200 SuccessResponse / 404
- **処理**: deletedAt セット + isActive=false（論理削除）
- **x-policy**: AUDIT_LOG
- **DB**: User, AuditEvent

#### API-ADMIN-13: POST /api/v1/admin/users/{userId}/freeze
- **Request**: GenericWriteRequest
- **Response**: 201 SuccessResponse
- **x-policy**: AUDIT_LOG
- **DB**: User, AuditEvent

#### API-ADMIN-14: POST /api/v1/admin/users/{userId}/unfreeze
- **Request**: GenericWriteRequest
- **Response**: 201 SuccessResponse
- **x-policy**: AUDIT_LOG
- **DB**: User, AuditEvent

### Frontend（Admin App）

#### ADM-UI-03: 受講者管理一覧
- **Path**: /admin/learners
- **Figma**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8350-4&m=dev
- **機能**:
  - ユーザー一覧テーブル（globalRole=learner でフィルタ表示）
  - 検索（名前・メール）
  - ステータスフィルター（アクティブ/凍結/削除済み）
  - 全カラムソート
  - ページネーション
  - 「受講者を招待」ボタン → モーダルダイアログ（API-ADMIN-10）
- **API**: API-ADMIN-09（一覧）、API-ADMIN-10（招待）

#### ADM-UI-04: 受講者詳細
- **Path**: /admin/learners/[userId]
- **Figma**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8351-4&m=dev
- **機能**:
  - ユーザー基本情報表示
  - 受講履歴一覧
  - 決済履歴一覧
  - 編集（API-ADMIN-11）
  - 凍結/解除（API-ADMIN-13/14）
  - 論理削除（API-ADMIN-12）
- **API**: API-ADMIN-09（ユーザー取得）、API-ADMIN-11〜14

#### ADM-UI-05: 講師管理一覧
- **Path**: /admin/instructors
- **Figma**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8348-4&m=dev
- **機能**: ADM-UI-03 と同構成（globalRole=instructor でフィルタ）
- **追加**: 「講師を招待」ボタン → モーダルダイアログ（API-ADMIN-10）
- **API**: API-ADMIN-09（一覧）、API-ADMIN-10（招待）

#### ADM-UI-06: 講師詳細
- **Path**: /admin/instructors/[userId]
- **Figma**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8349-4&m=dev
- **機能**: ADM-UI-04 と同構成 + 開講講座一覧、収益情報
- **API**: API-ADMIN-09（ユーザー取得）、API-ADMIN-11〜14

## DB参照テーブル
- User（globalRole, isActive, deletedAt）
- AuditEvent（AUDIT_LOG 記録）
- OAuthIdentity（lastLoginAt 参照）

## 実装手順

### Backend
1. AdminUserController（API-ADMIN-09〜14 の6エンドポイント）
2. AdminUserUseCase（一覧/招待/編集/削除/凍結/解除）
3. UserRepository（findMany/findById/create/update/softDelete）
4. AuditEventRepository（create）
5. テスト（正常系 + 権限NG + 409 Conflict）

### Frontend
1. 受講者一覧ページ（/admin/learners）
2. 受講者詳細ページ（/admin/learners/[userId]）
3. 講師一覧ページ（/admin/instructors）
4. 講師詳細ページ（/admin/instructors/[userId]）
5. 招待モーダルコンポーネント（UserInviteRequest）
6. ユーザー編集フォーム
7. 凍結/解除/削除の確認ダイアログ

## 受け入れ基準
- [ ] API-ADMIN-09〜14 が OpenAPI仕様と完全一致
- [ ] 受講者一覧: 検索、フィルター、ソート、ページネーション動作
- [ ] 講師一覧: 同上
- [ ] 招待モーダル: メール送信成功 / 409エラーハンドリング
- [ ] 詳細画面: 編集、凍結/解除、削除が動作
- [ ] 全AUDIT_LOG対象操作で監査ログ記録
- [ ] 権限チェック: operator, root_operator のみアクセス可
- [ ] テスト全通過

## 依存
- ADMIN-00（Auth基盤・共通レイアウト・共通コンポーネント）
