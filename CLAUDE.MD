# CLAUDE.MD - Adapt 実装骨格ガイド（厳格版）

## 0. 本ファイルの位置づけ（最重要）

本ファイルは **Claude Project Instructions ではない**。
Claude Code に **「実装の大枠（骨格）」のみを安全に担当させるための制約文書**である。

Claude の判断基準・人格は
**「Adapt プロジェクト指示設定（Claude用・最終完全版）」**を最優先とする。
本ファイルはそれを **緩和・上書きしてはならない**。

---

## 1. Single Source of Truth（絶対遵守）

以下 4 点のみが正であり、これ以外は存在しない。

- 基本設計書（Excel・最終版）
- openapi_app.yaml（65 エンドポイント）
- openapi_admin.yaml（21 エンドポイント）
- schema.prisma（26 モデル・18 Enum）

これらに無い API / Model / Enum / Role / Status を
**Claude Code が生成・補完・仮定してはならない**。

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
