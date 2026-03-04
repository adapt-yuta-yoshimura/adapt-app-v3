# ADMIN-04: 講座管理

## 概要
講座の一覧、代理作成、承認・審査、凍結/解除、削除、監査閲覧を実装する。

## 画面
- **ADM-UI-10**: 講座一覧（全体）（/admin/courses）
- **ADM-UI-11**: 講座代理作成（/admin/courses/new）
- **ADM-UI-13**: 講座詳細・監査（/admin/courses/[courseId]）

## 除外（別チケット）
- **ADM-UI-12**: 講座代理編集（/admin/courses/[courseId]/edit）→ INS-UI-05 作成後に対応

## ロール
- operator, root_operator（一部 root_operator のみ: 凍結解除 API-ADMIN-07）

## API一覧

| API ID | Method | Path | Summary | x-roles | x-policy |
|--------|--------|------|---------|---------|----------|
| API-ADMIN-01 | GET | /api/v1/admin/courses | 全講座一覧 | operator, root_operator | - |
| API-ADMIN-02 | POST | /api/v1/admin/courses | 講座代理作成 | operator, root_operator | AUDIT_LOG |
| API-ADMIN-03 | PATCH | /api/v1/admin/courses/{courseId} | 講座代理編集 | operator, root_operator | AUDIT_LOG |
| API-ADMIN-04 | DELETE | /api/v1/admin/courses/{courseId} | 講座削除 | operator, root_operator | AUDIT_LOG |
| API-ADMIN-05 | POST | /api/v1/admin/courses/{courseId}/approve | 講座承認 | operator, root_operator | AUDIT_LOG |
| API-ADMIN-06 | POST | /api/v1/admin/courses/{courseId}/freeze | コース凍結 | operator, root_operator | AUDIT_LOG |
| API-ADMIN-07 | POST | /api/v1/admin/courses/{courseId}/unfreeze | コース凍結解除 | root_operator | - |
| API-ADMIN-08 | GET | /api/v1/admin/audit/courses/{courseId} | [監査]凍結講座閲覧 | operator, root_operator | AUDIT_LOG(強制) |

## スコープ

### Backend（API）

#### API-ADMIN-01: GET /api/v1/admin/courses
- **Response**: CourseListResponse（items: CourseAdminView[], meta: ListMeta）
- **DB**: Course

#### API-ADMIN-02: POST /api/v1/admin/courses
- **Request**: AdminCourseCreateRequest（ownerUserId 必須）
- **Response**: 201 Course / 400 / 401 / 403
- **処理**: ownerUserId=指定講師、status=draft、承認免除
- **x-policy**: AUDIT_LOG
- **DB**: Course, CourseMember, AuditEvent

#### API-ADMIN-03: PATCH /api/v1/admin/courses/{courseId}
- **Request**: AdminCourseUpdateRequest（title?, description?, catalogVisibility?, visibility?, ownerUserId?）
- **Response**: 200 CourseDetailView / 404
- **x-policy**: AUDIT_LOG
- **DB**: Course, AuditEvent

#### API-ADMIN-04: DELETE /api/v1/admin/courses/{courseId}
- **Response**: 200 SuccessResponse / 404
- **処理**: status=archived に変更（論理削除）
- **x-policy**: AUDIT_LOG
- **DB**: Course, AuditEvent

#### API-ADMIN-05: POST /api/v1/admin/courses/{courseId}/approve
- **Request**: GenericWriteRequest
- **Response**: 201 CourseDetailView
- **処理**: status を active に変更、LP公開
- **x-policy**: AUDIT_LOG
- **DB**: Course, AuditEvent

#### API-ADMIN-06: POST /api/v1/admin/courses/{courseId}/freeze
- **Request**: GenericWriteRequest
- **Response**: 201 CourseDetailView
- **処理**: isFrozen=true、全更新APIを423 Lockedにする
- **x-policy**: AUDIT_LOG
- **DB**: Course, AuditEvent

#### API-ADMIN-07: POST /api/v1/admin/courses/{courseId}/unfreeze
- **Request**: GenericWriteRequest
- **Response**: 201 CourseDetailView
- **x-roles**: root_operator のみ
- **DB**: Course

#### API-ADMIN-08: GET /api/v1/admin/audit/courses/{courseId}
- **Response**: GenericDetailView
- **処理**: 凍結中の秘匿コンテンツ精査、閲覧ログ強制記録
- **x-policy**: AUDIT_LOG(強制)
- **DB**: Course, AuditEvent

### Frontend（Admin App）

#### ADM-UI-10: 講座一覧（全体）
- **Path**: /admin/courses
- **Figma**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8353-2&m=dev
- **機能**:
  - 講座一覧テーブル
  - バッジ: CourseStatus（draft/pending_approval/active/archived）、CourseStyle（one_on_one/seminar/bootcamp/lecture）、CourseCatalogVisibility
  - 検索、ステータスフィルター
  - 全カラムソート、ページネーション
  - 「講座を代理作成」ボタン → ADM-UI-11 へ遷移
- **API**: API-ADMIN-01

#### ADM-UI-11: 講座代理作成
- **Path**: /admin/courses/new
- **Figma**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8354-2&m=dev
- **機能**:
  - 作成フォーム（AdminCourseCreateRequest）
  - ownerUserId: 講師選択（ユーザー検索で指定）
  - 送信 → API-ADMIN-02
  - 成功時: 講座一覧へリダイレクト
- **API**: API-ADMIN-02、API-ADMIN-09（講師候補の検索用）

#### ADM-UI-13: 講座詳細・監査
- **Path**: /admin/courses/[courseId]
- **Figma（詳細）**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8355-2&m=dev
- **Figma（審査パネル）**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=8356-3&m=dev
- **機能**:
  - 講座詳細情報表示
  - 審査パネル: 承認ボタン（API-ADMIN-05）
  - 凍結/凍結解除ボタン（API-ADMIN-06/07）
  - 削除ボタン（API-ADMIN-04、確認ダイアログ）
  - 監査ログ表示
  - 「編集画面へ」遷移alertリンク → ADM-UI-12（未実装の旨を表示）
- **API**: API-ADMIN-01（取得）、API-ADMIN-03〜08

## DB参照テーブル
- Course（status, style, catalogVisibility, isFrozen, ownerUserId 等）
- CourseMember（代理作成時に instructor ロールで追加）
- User（ownerUserId の講師情報参照）
- AuditEvent（監査ログ）

## 実装手順

### Backend
1. AdminCourseController（API-ADMIN-01〜08 の8エンドポイント）
2. AdminCourseUseCase（一覧/作成/編集/削除/承認/凍結/解除/監査閲覧）
3. CourseRepository（findMany/findById/create/update/archive/freeze/unfreeze）
4. CourseMemberRepository（create）
5. AuditEventRepository の利用
6. テスト（正常系 + 権限 + 凍結解除: root_operator限定）

### Frontend
1. 講座一覧ページ（/admin/courses）
2. 講座代理作成ページ（/admin/courses/new）
3. 講座詳細・監査ページ（/admin/courses/[courseId]）
4. CourseStatusBadge / CourseStyleBadge / CatalogVisibilityBadge
5. 審査パネルコンポーネント
6. 凍結/解除/削除の確認ダイアログ

## 受け入れ基準
- [ ] API-ADMIN-01〜08 が OpenAPI仕様と完全一致
- [ ] 講座一覧: 全Enumバッジ正しく表示
- [ ] 代理作成: ownerUserId指定、status=draft で作成
- [ ] 承認: status → active に変更
- [ ] 凍結: isFrozen=true + 監査ログ記録
- [ ] 凍結解除: root_operator のみ実行可能
- [ ] 監査閲覧: AUDIT_LOG(強制)でログ記録
- [ ] ADM-UI-12 への遷移はalert表示（未実装の旨）
- [ ] テスト全通過

## 依存
- ADMIN-00（Auth基盤・共通レイアウト・共通コンポーネント）

## 備考
- ADM-UI-12（講座代理編集）は INS-UI-05（講師側講座編集）作成後に対応予定
- API-ADMIN-03（講座代理編集API）はBackend側のみこのチケットで実装し、Frontend画面は後続チケット
