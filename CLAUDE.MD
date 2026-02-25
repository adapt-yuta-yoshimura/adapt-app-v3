# CLAUDE.MD - Adapt 実装骨格ガイド（厳格版）

## 0. 本ファイルの位置づけ（最重要）

本ファイルは **Claude Project Instructions ではない**。
Claude Code に **「実装の大枠（骨格）」のみを安全に担当させるための制約文書**である。

Claude の判断基準・人格は
**「Adapt プロジェクト指示設定（Claude用・最終完全版）」**を最優先とする。
本ファイルはそれを **緩和・上書きしてはならない**。

### 契約階層（確定）
```
【最上位】Project Instructions（思想・判断基準）
    ↓ 引用・参照
【下位】  CLAUDE.MD（実装ガード・Claude Code専用）
    ↓ 実行
【実行層】Claude Code（骨格生成AI）
```

本文書はProject Instructionsの**下位契約**であり、思想・原則はProject Instructionsから引用する。

---

## 0-1. Project Instructions参照の整合性保証

本文書は Project Instructions（最上位契約）の思想を前提とする。

### 参照ルールの存在確認

- CLAUDE.MD内で `※ Project Instructions「〇〇ルール」を前提とする` と記載された箇所について
- 該当ルール名がProject Instructions内に存在しない場合
- **即座に停止し、このチャットへ報告すること**

### 停止時の報告フォーマット
```
⚠️ 参照エラー検知（CLAUDE.MD → Project Instructions）

- 検知者：Claude Code
- 参照元：CLAUDE.MD [該当セクション名]
- 参照先：Project Instructions「〇〇ルール」
- 状態：参照先ルールが存在しません

【推定原因】
- Project Instructions側でルール名が変更された
- CLAUDE.MD側の参照名が古い

【必要な対応】
1. Project Instructions内で該当ルールの現在名を確認
2. CLAUDE.MD内の参照名を更新
3. 参照先ルール名一覧表を更新
```

### 更新時の相互チェック

- Project Instructions更新時：CLAUDE.MD内の参照先が全て有効か確認
- CLAUDE.MD更新時：参照先ルールがProject Instructions内に存在するか確認

---

## 0-2. 参照先ルール名一覧表

本文書が参照するProject Instructionsのルール名（最終更新：2026-02-24）

| ルール名 | 参照箇所（CLAUDE.MD内） | 状態 |
|---------|----------------------|------|
| SoT定義 | §1 Single Source of Truth | 有効 |
| 推測断定禁止ルール | §4 実装前提条件 | 有効 |
| ツール分担方針 | §6 Claude Codeの役割 | 有効 |

**運用ルール：**
- 新規参照追加時は、必ず本一覧も更新すること
- 一覧表の最終更新日も同時に更新すること
- 一覧にない参照を検知した場合は即座に停止

**陳腐化警告：**
- 最終更新日が3ヶ月以上前の場合、警告を出す

---

## 0-3. ドラフト参照の運用

※ Project Instructions「推測断定禁止ルール」を前提とする

### ドラフト段階の参照明示

ドラフト段階の参照は、以下のように明示すること：
```markdown
※ Project Instructions「〇〇ルール（ドラフト参照）」を前提とする
```

### 段階別の運用

| 段階 | 一覧未登録参照の扱い | 動作 |
|------|-------------------|------|
| **ドラフト開発** | 「（ドラフト参照）」明示で許容 | ⚠️ 警告のみ |
| **レビュー** | 一覧登録を促す | ⚠️ 警告 + 指摘 |
| **正式反映** | 禁止 | ❌ 停止 |

### 判定ロジック
```
【参照検知時の判定フロー】

1. CLAUDE.MD内で参照を検知
   ↓
2. 「（ドラフト参照）」の記載があるか？
   ↓
   Yes → ⚠️ 警告出力（停止しない）
          「ドラフト参照が残っています。正式反映前に一覧登録してください」
   ↓
   No → 一覧表に登録されているか？
         ↓
         Yes → ✅ 正常実行
         ↓
         No → ❌ 停止 + 報告
              「参照エラー検知：一覧未登録の参照が存在します」
```

### 正式反映時の必須作業

- すべての「（ドラフト参照）」マーカーを削除
- 参照先ルール名一覧表へ登録
- 一覧表の最終更新日を更新

---

## 1. Single Source of Truth（絶対遵守）

以下 4 点のみが正であり、これ以外は存在しない。

- 基本設計書（Excel・最終版）
- openapi_app.yaml
- openapi_admin.yaml
- schema.prisma

これらに無い API / Model / Enum / Role / Status を
**Claude Code が生成・補完・仮定してはならない**。

---

### 1-1. SoTファイルの正規配置（契約固定）

※ Project Instructions「SoT定義」を前提とする

以下のSoTファイルは、契約上の正規配置として固定する：

| ファイル名 | 正規配置 |
|-----------|---------|
| 基本設計書（Excel・最終版） | `/docs/design/adapt_基本設計_最終版.xlsx` |
| openapi_app.yaml | `/docs/api/openapi_app.yaml` |
| openapi_admin.yaml | `/docs/api/openapi_admin.yaml` |
| schema.prisma | `/docs/api/schema.prisma` |

**配置変更履歴：**
- 2026-02-25：`/adapt-design-files/` から `/docs/` へ変更（Phase 3 実施）

**配置変更時の契約更新：**
- 正規配置を変更する場合、本セクションの更新が必須
- 配置変更はリポジトリ構造の大規模変更を伴うため、慎重に実施

---

### 1-2. SoTファイル探索時の安全装置

Claude Codeは、以下のフローで判定する：

#### 判定フロー

1. **正規配置に存在するか？**
   - `/docs/` 配下を確認（`/docs/api/` または `/docs/design/`）
   - No → ❌ **ケースB：停止＋報告**
   - Yes → 次へ

2. **正規配置外の件数は？**
   - **※ 正規配置外の件数：リポジトリ全体から正規配置パスを除いた件数**
   - 0件 → ✅ **ケースA：正常実行**
   - 1件 → ❌ **ケースC：停止＋報告（旧正規配置の可能性）**
   - 2件以上 → ❌ **ケースD：停止＋報告**

#### ケース別動作

| ケース | 正規配置 | 正規配置外 | 合計 | 動作 |
|--------|---------|-----------|------|------|
| A | 1件 | 0件 | 1件 | ✅ 正常実行 |
| B | 0件 | 任意 | 任意 | ❌ 停止「正規配置にSoTファイルが存在しません」 |
| C | 1件 | 1件 | 2件 | ❌ 停止「正規配置外に1件検出（旧正規配置の可能性）」 |
| D | 1件 | 2件以上 | 3件以上 | ❌ 停止「正規配置外に複数検出（整理が必要）」 |

#### 報告フォーマット

**ケースB：正規配置不在**
```
⚠️ SoTファイル探索失敗（正規配置不在）

- 検索対象：[ファイル名]
- 正規配置：/docs/api/[ファイル名] または /docs/design/[ファイル名]
- 状態：正規配置にファイルが存在しません

【必要な対応】
- ファイルが削除されていないか確認
- 正規配置が変更されていないか確認
- CLAUDE.MD §1-1 の正規配置定義を確認
```

**ケースC：正規配置外に1件検出**
```
⚠️ SoTファイル探索失敗（正規配置外に1件検出）

- 使用ファイル：/docs/[api|design]/[ファイル名]（正規配置）
- 検出ファイル：[パス]

【状態】
- 正規配置外に同名ファイルが存在しています

【必要な対応】
- 検出ファイルの用途を確認（運用版・バックアップ等）
- 正規配置は `/docs/` のみ
- 探索安全装置により停止します
```

**ケースD：正規配置外に複数検出**
```
⚠️ SoTファイル探索失敗（複数候補検出）

- 検索対象：[ファイル名]
- 正規配置：/docs/[api|design]/[ファイル名]
- 検出件数：[N]件
- 検出パス：
  1. /docs/[api|design]/[ファイル名]（正規配置）
  2. [パス2]
  3. [パス3]

【リスク】
複数候補が存在する状態は誤参照のリスクが高いです。

【必要な対応】
- 正しいSoTファイルのパスを特定
- 不要なコピー・バックアップを削除または別名化
- SoTファイルが正規配置のみになるよう整理
- 整理後、再実行
```

#### 設計原則

- 判定は合計件数ではなく「正規配置外の件数」で一意に決定
- 外部1件：停止（旧正規配置の可能性、二重存在は契約違反）
- 外部2件以上：即停止（異常状態）
- 移動判断は人間が行う（Claude Codeは検出・停止のみ）

#### 既知の許容状態（ケースCの例外：schema.prisma のみ）

**本例外は schema.prisma にのみ適用する。他のSoTファイル（openapi_admin.yaml, openapi_app.yaml, adapt_基本設計_最終版.xlsx）は従来通りケースCで停止する。**

schema.prisma でケースCが発生した場合、以下の条件をすべて満たすときは停止せず継続する：

1. 検出パスが `apps/api/prisma/schema.prisma` である
2. 両ファイルの内容差分が Prisma 7 の `datasource.url` 移動（prisma.config.ts）に起因するもののみ
3. 上記以外の差分がある場合は停止

#### schema.prisma の正と写像

- **正（SoT）：** `/docs/api/schema.prisma`
- **写像（運用版）：** `apps/api/prisma/schema.prisma`（Prisma CLI 用）
- 設計変更は必ず SoT を先に更新し、運用版に同一コミット内で反映する

#### /adapt-design-files の扱い（SoT更新：2026-02-25）

- `/adapt-design-files/` は廃止された旧正規配置
- Phase 3 完了後に削除済み（コミット: a49a152）
- 正規配置は `/docs/` のみ

---

## 2. ロール方針（厳格）

- 契約・実装上の正式ロール名は **`root_operator`**
- `root` は表示ラベル扱い
- enum / claim / guard / policy / OpenAPI で `root` を使用しない
- 新たなロール・権限追加は禁止

### SoT 上の Enum（参照のみ・追加禁止）

| スコープ | Enum 名 | 値 |
|---|---|---|
| グローバル | `GlobalRole` | guest, learner, instructor, operator, root_operator |
| コース内 | `CourseMemberRole` | instructor_owner, learner, instructor, assistant |

> ※ `assistant` はコース内ロール（CourseMemberRole）のみ。GlobalRole には含まない
> ※ `PlatformMembership` / `PlatformRole` は廃止（User.globalRole に統合）
> ※ 運営スタッフ判定: User.globalRole が operator / root_operator かで判定

---

## 3. 技術スタック（参考情報・骨格生成時の前提）

以下は SoT / 既存設定から取得した技術情報の要約である。
実体は package.json / schema.prisma / tsconfig.json 等にあり、
乖離がある場合はそちらを正とすること。
```
Backend:
  - NestJS 10.3+
  - Prisma 7（prisma-client-js / binaryTargets: native, linux-musl-openssl-3.0.x）
  - PostgreSQL 16
  - Socket.IO 4.6+（チャット用リアルタイム通信）
  - 認証: OIDC + Google OAuth（auth.adapt-co.io）

Frontend:
  - Next.js 15.0+（App Router）
  - React 19.0+
  - TanStack Query 5.17+
  - Tailwind CSS 3.4+
  - shadcn/ui

構成:
  - モノレポ（Turborepo + pnpm workspace）
  - TypeScript 5.3+

ドメイン:
  - app.adapt-co.io      # 受講者・講師向け
  - admin.adapt-co.io    # 運営者向け
  - auth.adapt-co.io     # 認証基盤
```

---

### 3-1. Prisma プロバイダー移行計画（prisma-client-js → prisma-client）

#### 現状

- Prisma 7.4.1 で `prisma-client-js`（旧プロバイダー）を使用中
- Prisma 7 では非推奨だが動作する
- 最小限アップグレード方針により、移行は先送り

#### 移行ゲート条件（以下のいずれかを満たした場合に移行を検討）

1. **Prisma のメジャーアップデート時：** prisma-client-js が削除・動作不能になった場合
2. **実装進捗 50% 超過時：** インポートパス変更の影響範囲が確定した段階
3. **CI/CD 本格導入時：** ビルドパイプラインの安定化と合わせて実施
4. **prisma generate の出力差異検出時：** 旧プロバイダーの生成物に問題が発生した場合

#### 移行時の影響範囲（見込み）

- インポートパス変更（`@prisma/client` → 新パス）
- ドライバーアダプター追加
- PrismaService の書き換え
- ESM 対応の確認

#### 重要

- 上記ゲート条件に該当しない限り、移行を提案・実施してはならない
- ゲート条件該当時は SoT更新宣言を経て移行計画を策定する

---

## 4. ディレクトリ構成（確定・逸脱禁止）
```
adapt/
├── apps/
│   ├── api/               # NestJS API（ポート: 4000）
│   ├── web/               # Next.js 15 Web App（ポート: 3000）
│   └── admin/             # Next.js 15 Admin App（ポート: 3001）
├── packages/
│   ├── shared/            # 共有型定義・Zodスキーマ
│   ├── ui/                # UIコンポーネントライブラリ
│   ├── types/             # OpenAPI生成型置き場
│   ├── eslint-config/     # ESLint設定
│   └── typescript-config/ # TypeScript設定
├── docs/
│   ├── api/               # OpenAPI仕様ファイル
│   ├── design/            # 基本設計書
│   └── guides/            # 開発ガイド
└── tickets/               # 実装チケット（API-xxx.md）
```

### NestJS モジュール構成（1モジュールあたり）
```
apps/api/src/modules/{module}/
├── controllers/       # APIエンドポイント（薄い層）
├── usecases/          # ビジネスロジック（ORM非依存）
├── repositories/      # データアクセス（Prisma隠蔽）
├── dtos/              # Request/Response型（OpenAPI生成型使用推奨）
├── entities/          # ドメインエンティティ（必要に応じて）
├── gateways/          # WebSocket（必要に応じて）
└── {module}.module.ts
```

### 共通層（modules 外）
```
apps/api/src/common/
└── auth/
    ├── jwt-token.service.ts  # JWT署名・検証（技術サービス・クラス名維持）
    ├── jwt.types.ts          # JWT関連の型定義
    └── index.ts              # barrel export
```

> `common/` は **モジュール横断の技術サービス** を配置する層である。
> UseCase から DI で利用する。Repository と同様に「実装詳細の隠蔽」として扱う。
> UseCase ではないため `〜UseCase` と命名しない。

---

## 5. 命名規則（確定・変更禁止）

| 対象 | 規則 | 例 |
|---|---|---|
| ファイル名 | kebab-case | `course-repository.ts` |
| クラス名 | PascalCase | `CourseRepository` |
| 変数・関数 | camelCase | `getUserById` |
| 定数 | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE` |
| 型・インターフェース | PascalCase | `CreateCourseDto` |
| DBカラム | snake_case（@@map 済み） | `owner_user_id` |
| APIパス | kebab-case + REST | `/api/v1/courses` |
| React Component | PascalCase（例外） | `CourseCard.tsx` |

---

## 6. Claude Code に許可されている責務（ここまで）

Claude Code が **やってよいことは以下のみ**。

### 6.1 許可されている作業

- モノレポ / ディレクトリ構造の生成（§4 に準拠）
- OpenAPI / Prisma / Excel の整合性チェック
- OpenAPI 型生成・import までの配線
- Controller / UseCase / Repository の **空構造（枠）生成**
- 共通 Guard / Policy の **枠（中身なし）**
- 実装チケット（API-xxx.md）の生成（§9 テンプレートに準拠）
- 行番号・セル番号・path を固定した **自動編集パッチ**

### 6.2 必須ルール

- 中身のロジックは **書かない**
- 未定義仕様は **必ず TODO(TBD) を書いて停止**
- enum / status / role に触れる変更は **即停止して質問**

---

## 7. 「枠」の定義と境界（具体例）

Claude Code が生成してよい「枠」と、踏み込んではならない「実装」の境界を示す。

### ✅ 許可：枠（この範囲まで）
```typescript
import type { paths } from '@adapt/types/openapi-app';

type GetCourseResponse =
  paths['/api/v1/courses/{id}']['get']['responses']['200']['content']['application/json'];

@Controller('api/v1/courses')
@UseGuards(AuthGuard, RolesGuard)
export class CourseController {
  constructor(private readonly usecase: CourseUseCase) {}

  @Get(':id')
  @Roles('learner', 'instructor')
  async getCourse(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<GetCourseResponse> {
    // TODO(TBD): Cursor実装 - CourseUseCase.getCourse
    throw new Error('Not implemented');
  }
}
```
```typescript
@Injectable()
export class CourseUseCase {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly memberRepo: CourseMemberRepository,
  ) {}

  async getCourse(userId: string, courseId: string): Promise<GetCourseResponse> {
    // TODO(TBD): Cursor実装
    // - データ取得（courseRepo.findById）
    // - 権限チェック（CourseMember確認）
    // - 凍結チェック（FreezePolicy）
    // - レスポンス変換
    throw new Error('Not implemented');
  }
}
```
```typescript
@Injectable()
export class CourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Course | null> {
    // TODO(TBD): Cursor実装
    throw new Error('Not implemented');
  }
}
```

### ❌ 禁止：実装（ここから先は Cursor）
```typescript
// ❌ ビジネスロジックの記述
async getCourse(userId: string, courseId: string): Promise<GetCourseResponse> {
  const course = await this.courseRepo.findById(courseId);
  if (!course) throw new NotFoundException('Course not found');
  // ↑ この詳細は Cursor の責務
}

// ❌ 権限・凍結の判定ロジック
if (member.role === 'instructor_owner' && !course.isFrozen) { ... }

// ❌ Prisma クエリの具体実装
return this.prisma.course.findUnique({
  where: { id },
  include: { members: true },
});
```

---

## 8. Claude Code に禁止されている行為

以下は **絶対禁止**。

- ビジネスロジックの具体実装
- 権限・凍結・例外仕様の補完
- ステータス遷移の確定
- OpenAPI に無い I/O の仮実装
- 「一般的には〜」という判断
- Cursor がやるべき詳細実装への踏み込み
- `any` 型の使用（`unknown` を使用）
- SoT に無い機能・API・Model の追加

---

## 9. 実装チケットテンプレート（固定）

`tickets/API-xxx.md` は以下のフォーマットで生成すること。
```markdown
# API-xxx: [エンドポイント名]

## 基本情報
- **Method**: GET/POST/PATCH/DELETE
- **Path**: /api/v1/xxx
- **OperationId**: （OpenAPI の operationId）
- **OpenAPI**: openapi_app.yaml or openapi_admin.yaml

## リクエスト
（OpenAPI 定義から転記）

## レスポンス
（OpenAPI 定義から転記）

## DB参照テーブル
（schema.prisma から特定）

## ガード観点
- **認証**: 必須 or 不要
- **ロール**: x-roles から転記
- **凍結**: 423 エラー返却要否
- **threads-only**: 制約の考慮要否

## 実装手順
1. **Controller**: `XxxController.method()`
2. **UseCase**: `XxxUseCase.method()`
3. **Repository**: `XxxRepository.method()`
4. **テスト**: 正常系 + 異常系

## 受け入れ基準
- [ ] OpenAPI仕様と完全一致
- [ ] 権限チェック実装
- [ ] 凍結チェック実装（該当する場合）
- [ ] threads-onlyチェック実装（該当する場合）
- [ ] テスト全通過
```

---

## 10. 自動編集パッチの厳格ルール

- 編集対象は必ず一意に特定する
  （行番号 / セル番号 / OpenAPI path / Prisma model）
- before / after を必ず明示
- 同一検索キーが複数ある場合は **即停止**
- 意味が変わる可能性がある編集は禁止

---

## 11. アーキテクチャ原則（事実・逸脱禁止）

以下は SoT で確定しているアーキテクチャ制約である。
Claude Code は枠生成時にこれに従うこと。
```
Controller（薄い層）
    ↓ HTTPリクエスト/レスポンス処理のみ
UseCase（厚い層）
    ↓ ビジネスロジック、Prisma非依存
Repository（Prismaのみ）
    ↓ DB操作、Prismaを完全隠蔽
Prisma Client
    ↓
PostgreSQL
```

- UseCase 層で Prisma を直接使用 → **禁止**
- Controller 層で Repository を直接呼び出し → **禁止**
- Prisma Model を API レスポンスで直接返す → **禁止**
- OpenAPI 生成型を Controller の戻り値型に使用 → **必須**

### UseCase 粒度ルール（確定）

| 区分 | 方針 | 例 |
|---|---|---|
| 既存モジュール（auth / chat / course） | Facade 型 UseCase（1クラス多メソッド）を許容 | `AuthUseCase`（複数メソッド） |
| 新規モジュール（admin 等） | 1 UseCase 1 ファイルを原則 | `AddOperatorUseCase` |
| 分割トリガー | クラス規模超過 / 責務分岐 / テスト困難 のいずれかで分割 | ― |

### UseCase と技術サービスの責務境界

| 層 | 責務 | 命名 | 配置 |
|---|---|---|---|
| UseCase | **何をするか**（業務フローの指揮） | `〜UseCase` | `modules/{module}/usecases/` |
| 技術サービス | **どうやるか**（暗号・署名・設定等） | `〜Service`（維持） | `common/{domain}/` |
| Repository | **どこから取るか**（DB操作） | `〜Repository` | `modules/{module}/repositories/` |

- 技術サービス（`common/`）は UseCase から DI で利用する
- `services/` ディレクトリを modules 内に作成してはならない

---

## 12. Claude Code の成功状態

- 生成物が少ない
- TODO(TBD) が多い
- 質問が多い
- Cursor 側が迷わない

これは **正常状態**である。

---

## 13. 結論

Claude Code は
**「設計を壊さず、実装を進めやすくする"骨格専任AI"」**である。

仕様決定・詳細実装は
**絶対に Cursor / 人間へ委譲すること。**
