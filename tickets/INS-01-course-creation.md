# INS-01: 講座作成（スタイル選択 + 1on1/セミナー + ブートキャンプウィザード）

## 概要

講師が講座を新規作成するフロー全体を実装する。
スタイル選択（INS-UI-04）から、1on1/セミナーの1画面作成（INS-UI-18）、
ブートキャンプの3ステップウィザード（INS-UI-19〜22）、および関連API群をカバーする。

## 画面

- **INS-UI-04**: 講座作成（スタイル選択）（/instructor/courses/new）
- **INS-UI-18**: 講座作成（1on1/セミナー）（/instructor/courses/new/simple）
- **INS-UI-19**: 講座作成（ブートキャンプ STEP1: 基本情報・LP）（/instructor/courses/new/bootcamp）
- **INS-UI-20**: 講座作成（ブートキャンプ STEP2: シラバス・レッスン構成）（/instructor/courses/[courseId]/bootcamp/syllabus）
- **INS-UI-21**: 講座作成（ブートキャンプ STEP2: レッスン編集）（/instructor/courses/[courseId]/bootcamp/lessons/[lessonId]）
- **INS-UI-22**: 講座作成（ブートキャンプ STEP3: 公開設定・承認申請）（/instructor/courses/[courseId]/bootcamp/publish）

## 除外（別チケット）

- **INS-UI-05**: 講座編集（1on1/セミナー作成後の編集） → INS-02 で対応
- **INS-UI-23〜25**: ブートキャンプ運営画面 → INS-03 で対応

## ロール

- instructor（API-025〜027, 034〜041）
- instructor_owner（API-028〜031）

## API一覧

| API ID | Method | Path | Summary | x-roles | x-policy | Request DTO | Response DTO |
|--------|--------|------|---------|---------|----------|-------------|-------------|
| API-025 | GET | /api/v1/instructor/courses | 自講座一覧 | instructor | - | - | CourseListResponse |
| API-026 | POST | /api/v1/instructor/courses | 講座新規作成 | instructor | - | InstructorCourseCreateRequest | CourseDetailView |
| API-027 | GET | /api/v1/instructor/courses/{courseId} | 講座詳細取得(管理) | instructor | - | - | CourseDetailView |
| API-028 | PUT | /api/v1/instructor/courses/{courseId} | 講座情報更新 | instructor_owner | 423_ON_FROZEN | CourseUpdateRequest | CourseDetailView |
| API-029 | DELETE | /api/v1/instructor/courses/{courseId} | 講座削除(論理) | instructor_owner | - | - | SuccessResponse |
| API-030 | POST | /api/v1/instructor/courses/{courseId}/request-approval | 承認申請 | instructor_owner | 423_ON_FROZEN | GenericWriteRequest | CourseDetailView |
| API-031 | POST | /api/v1/instructor/courses/{courseId}/publish | コース公開 | instructor_owner | AUDIT_LOG | - | CourseDetailView |
| API-034 | GET | /api/v1/instructor/courses/{courseId}/syllabus | シラバス構造取得 | instructor | - | - | SyllabusView |
| API-035 | POST | /api/v1/instructor/courses/{courseId}/sections | セクション追加 | instructor | 423_ON_FROZEN | GenericWriteRequest | SyllabusView |
| API-036 | PUT | /api/v1/instructor/sections/{sectionId} | セクション編集 | instructor | 423_ON_FROZEN | GenericWriteRequest | SuccessResponse |
| API-037 | DELETE | /api/v1/instructor/sections/{sectionId} | セクション削除 | instructor | 423_ON_FROZEN | - | SuccessResponse |
| API-038 | POST | /api/v1/instructor/sections/{sectionId}/lessons | レッスン作成 | instructor | 423_ON_FROZEN | GenericWriteRequest | SuccessResponse |
| API-039 | GET | /api/v1/instructor/lessons/{lessonId} | レッスン詳細取得 | instructor | - | - | GenericDetailView |
| API-040 | PUT | /api/v1/instructor/lessons/{lessonId} | レッスン編集 | instructor | 423_ON_FROZEN | GenericWriteRequest | SuccessResponse |
| API-041 | DELETE | /api/v1/instructor/lessons/{lessonId} | レッスン削除 | instructor | 423_ON_FROZEN | - | SuccessResponse |

## スコープ

### Backend（API）

#### API-025: GET /api/v1/instructor/courses
- **Response**: CourseListResponse（items: Course[], meta: ListMeta）
- **DB**: Course（ownerUserId でフィルタ or CourseMember.role=instructor で取得）

#### API-026: POST /api/v1/instructor/courses
- **Request**: InstructorCourseCreateRequest（title, style 必須）
- **Response**: 201 CourseDetailView
- **処理**: Course 作成 + CourseMember（role=instructor）作成
- **DB**: Course, CourseMember

#### API-027: GET /api/v1/instructor/courses/{courseId}
- **Response**: CourseDetailView（course + channels + stats）
- **DB**: Course, CourseChannel, CourseMember

#### API-028: PUT /api/v1/instructor/courses/{courseId}
- **Request**: CourseUpdateRequest
- **Response**: CourseDetailView
- **x-policy**: 423_ON_FROZEN
- **DB**: Course

#### API-029: DELETE /api/v1/instructor/courses/{courseId}
- **Response**: SuccessResponse
- **処理**: status=archived に変更（論理削除）
- **DB**: Course

#### API-030: POST /api/v1/instructor/courses/{courseId}/request-approval
- **Request**: GenericWriteRequest
- **Response**: CourseDetailView
- **処理**: status を pending_approval に変更
- **x-policy**: 423_ON_FROZEN
- **DB**: Course

#### API-031: POST /api/v1/instructor/courses/{courseId}/publish
- **Response**: CourseDetailView
- **処理**: 承認済み講座を公開（status=active）
- **x-policy**: AUDIT_LOG
- **403**: ownerUserId不一致
- **DB**: Course, AuditEvent

#### API-034: GET /api/v1/instructor/courses/{courseId}/syllabus
- **Response**: SyllabusView（courseId + style + sections[CourseSection + lessons[]]）
- **DB**: Course, CourseSection, Lesson

#### API-035: POST /api/v1/instructor/courses/{courseId}/sections
- **Request**: GenericWriteRequest
- **Response**: 201 SyllabusView
- **処理**: CourseSection 追加後、更新後シラバス全体を返却
- **x-policy**: 423_ON_FROZEN
- **DB**: CourseSection

#### API-036: PUT /api/v1/instructor/sections/{sectionId}
- **Request**: GenericWriteRequest
- **Response**: SuccessResponse
- **x-policy**: 423_ON_FROZEN
- **DB**: CourseSection

#### API-037: DELETE /api/v1/instructor/sections/{sectionId}
- **Response**: SuccessResponse
- **x-policy**: 423_ON_FROZEN
- **DB**: CourseSection（+ 配下 Lesson の courseSectionId を null に更新 or カスケード削除）

#### API-038: POST /api/v1/instructor/sections/{sectionId}/lessons
- **Request**: GenericWriteRequest
- **Response**: SuccessResponse
- **x-policy**: 423_ON_FROZEN
- **DB**: Lesson（courseSectionId にセクション紐付け）

#### API-039: GET /api/v1/instructor/lessons/{lessonId}
- **Response**: GenericDetailView
- **DB**: Lesson

#### API-040: PUT /api/v1/instructor/lessons/{lessonId}
- **Request**: GenericWriteRequest
- **Response**: SuccessResponse
- **x-policy**: 423_ON_FROZEN
- **DB**: Lesson

#### API-041: DELETE /api/v1/instructor/lessons/{lessonId}
- **Response**: SuccessResponse
- **x-policy**: 423_ON_FROZEN
- **DB**: Lesson

### Frontend（Web App）

#### INS-UI-04: 講座作成（スタイル選択）
- **Path**: /instructor/courses/new
- **Figma**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=4829:7962&m=dev
- **機能**:
  - 3つのスタイルカード表示（1on1 / セミナー / ブートキャンプ）
  - カード選択 → スタイル別作成画面へ遷移
  - 1on1/セミナー → INS-UI-18（/instructor/courses/new/simple?style=one_on_one or seminar）
  - ブートキャンプ → INS-UI-19（/instructor/courses/new/bootcamp）
- **API**: なし（画面遷移のみ）

#### INS-UI-18: 講座作成（1on1/セミナー）
- **Path**: /instructor/courses/new/simple
- **Figma**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=4829:6009&m=dev
- **機能**:
  - 1画面完結の講座作成フォーム
  - style に応じて日程設定UIが条件分岐（1on1: 15/30/60分枠、セミナー: 複数回・15分刻み）
  - 入力項目: サムネイル、タイトル、日程、金額、LP項目（必要性/解決すること/前提条件/おすすめ）
  - 送信 → API-026（作成）→ API-030（承認申請）or API-031（限定公開）
- **API**: API-026, API-030, API-031

#### INS-UI-19: 講座作成（ブートキャンプ STEP1: 基本情報・LP）
- **Path**: /instructor/courses/new/bootcamp
- **Figma**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=4829:6321&m=dev
- **機能**:
  - サムネイル、タイトル・サブタイトル、メイン/サブ講師、金額、開催期間、申込期日
  - LP項目（必要性/解決すること/前提条件/おすすめ/講師紹介/FAQ）
  - 完了後 → API-026（作成）→ INS-UI-20（STEP2）へ遷移
- **API**: API-026, API-027

#### INS-UI-20: 講座作成（ブートキャンプ STEP2: シラバス・レッスン構成）
- **Path**: /instructor/courses/[courseId]/bootcamp/syllabus
- **Figma**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=4829:7191&m=dev
- **機能**:
  - セクション（週単位等）の追加・編集・削除
  - 各セクション内のレッスン一覧表示
  - レッスン選択 → INS-UI-21 へ遷移
  - ドラフト編集にも再利用
- **API**: API-034, API-035, API-036, API-037

#### INS-UI-21: 講座作成（ブートキャンプ STEP2: レッスン編集）
- **Path**: /instructor/courses/[courseId]/bootcamp/lessons/[lessonId]
- **Figma（座学）**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=4829:7366&m=dev
- **Figma（動画）**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=6320:5914&m=dev
- **Figma（ライブ）**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=6320:6213&m=dev
- **Figma（課題）**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=6320:6512&m=dev
- **機能**:
  - レッスンタイプ（座学/動画/ライブ・イベント/課題）に応じたフォーム切り替え
  - 座学: リッチテキスト、動画: アップロード/埋め込み、ライブ: 日時+URL、課題: 提出期限+確認期限
  - ドラフト編集にも再利用
- **API**: API-038, API-039, API-040, API-041

#### INS-UI-22: 講座作成（ブートキャンプ STEP3: 公開設定・承認申請）
- **Path**: /instructor/courses/[courseId]/bootcamp/publish
- **Figma**: https://www.figma.com/design/3nAHGGhB2dsyuMvYlrilWT/adapt-design-sot?node-id=4829:7711&m=dev
- **機能**:
  - 講座サマリー表示（タイトル、開催期間、申込期日、定員数、料金）
  - プレビュー確認
  - 「範囲を限定して公開する」→ API-031
  - 「承認申請する」→ API-030
- **API**: API-027, API-030, API-031

## DB参照テーブル

- Course（id, title, style, status, ownerUserId, createdByUserId 等）
- CourseMember（courseId, userId, role）
- CourseSection（id, courseId, title, order）
- Lesson（id, courseId, courseSectionId, title, type）
- AuditEvent（API-031 AUDIT_LOG 用）

## 実装手順

### Backend
1. InstructorCourseController（API-025〜031 の7エンドポイント）
2. InstructorSyllabusController（API-034〜041 の8エンドポイント）
3. InstructorCourseUseCase（一覧/作成/詳細/更新/削除/承認申請/公開）
4. SyllabusUseCase（シラバス取得/セクションCRUD/レッスンCRUD）
5. CourseRepository（findMany/findById/create/update/archive）
6. CourseSectionRepository（findByCourseId/create/update/delete）
7. LessonRepository（findBySectionId/findById/create/update/delete）
8. CourseMemberRepository（create/findByUserAndCourse）
9. テスト（正常系 + 権限NG + 凍結423 + AUDIT_LOG）

### Frontend
1. INS-UI-04: スタイル選択カード（3択 → 遷移）
2. INS-UI-18: 1on1/セミナー作成フォーム（style 条件分岐あり）
3. INS-UI-19: ブートキャンプ STEP1 フォーム
4. INS-UI-20: シラバスエディタ（セクション + レッスン一覧）
5. INS-UI-21: レッスン編集（タイプ別フォーム切り替え）
6. INS-UI-22: 公開設定サマリー + 承認申請/公開ボタン

## 受け入れ基準

- [ ] API-025〜031, API-034〜041 が OpenAPI仕様と完全一致
- [ ] INS-UI-04: 3スタイルの選択と遷移が動作
- [ ] INS-UI-18: 1on1/セミナーの日程設定が style に応じて正しく切り替わる
- [ ] INS-UI-18: 作成 → 承認申請 or 限定公開が動作
- [ ] INS-UI-19: ブートキャンプ STEP1 入力 → 作成 → STEP2 遷移
- [ ] INS-UI-20: セクション追加・編集・削除が動作
- [ ] INS-UI-20: レッスン選択 → INS-UI-21 遷移
- [ ] INS-UI-21: 4タイプ（座学/動画/ライブ/課題）のフォーム切り替えが動作
- [ ] INS-UI-22: サマリー表示 + 承認申請 or 限定公開が動作
- [ ] 423_ON_FROZEN 対象API: 凍結時に 423 エラーを返す
- [ ] API-031: AUDIT_LOG 記録
- [ ] API-031: ownerUserId不一致で 403 を返す
- [ ] テスト全通過

## 依存

- **apps/web/ 初期化**: ✅ 完了（956badb）
- **認証基盤（Web版）**: TODO(TBD) — OIDC連携は未実装。本チケットでは認証ミドルウェアのスタブで対応可。

## ブロッカー/TBD

- **認証ミドルウェア（Web版）**: Admin（ADMIN-00）と同様の Auth 基盤が Web 側に未整備。Backend 側の AuthGuard / RolesGuard は共通（common/auth/）で対応可能だが、Frontend 側のログイン画面・トークン管理は別途必要。
- **API-035〜041 のリクエスト型**: 現在 `GenericWriteRequest`（additionalProperties: true）。型安全性が低い。INS-01 実装開始時に具体型への置き換えを検討（SoT更新が必要）。
- **ファイルアップロード**: INS-UI-18/19 のサムネイル、INS-UI-21 の動画アップロードにはファイルアップロード API が必要。現在 SoT に未定義。

## 画面フロー（参考）

```
INS-UI-04（スタイル選択）
  ├→ INS-UI-18（1on1/セミナー作成 — 1画面完結）
  │    └→ 作成後の編集: INS-UI-05（→ INS-02 チケット）
  │
  └→ INS-UI-19（ブートキャンプ STEP1: 基本情報・LP）
       → INS-UI-20（STEP2: シラバス・レッスン構成）
           → INS-UI-21（レッスン編集 — 座学/動画/ライブ/課題）
       → INS-UI-22（STEP3: 公開設定・承認申請）
             └→ 作成後の編集: INS-UI-19〜21 を再利用
```
