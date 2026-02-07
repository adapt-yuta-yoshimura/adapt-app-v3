---
description: Adapt Admin 実装ルール（常時有効）
globs: apps/admin/**/*
alwaysApply: false
---

# Adapt Phase 0 — Cursor 実装引き渡し仕様書

## 概要

本ドキュメントは、Adapt プロジェクトの共通デザイン基盤（Phase 0）を
Cursor で実装するための引き渡し仕様書です。

**技術スタック**: Next.js (App Router) + Tailwind CSS + TypeScript
**Backend**: NestJS + Prisma + PostgreSQL
**デザインソース**: Figma (`hIWNItIPSUj2AGZdJu4q3F`)
**SoT**: openapi_admin.yaml / openapi_app.yaml / schema.prisma

---

## 1. ファイル構成（推奨）

```
adapt/
├── apps/
│   ├── admin/                    # Admin (admin.adapt-co.io)
│   │   ├── app/
│   │   │   ├── layout.tsx        # AdminLayout (Sidebar + Header)
│   │   │   ├── page.tsx          # Dashboard (redirect or landing)
│   │   │   ├── login/
│   │   │   │   └── page.tsx      # Admin Login (メール/PW のみ)
│   │   │   ├── operators/
│   │   │   │   ├── page.tsx      # 運営スタッフ一覧 (API-076)
│   │   │   │   └── new/
│   │   │   │       └── page.tsx  # スタッフ追加 (API-077)
│   │   │   └── users/
│   │   │       └── page.tsx      # ユーザー管理一覧 (API-073)
│   │   ├── tailwind.config.ts    # ← Phase 0 成果物
│   │   └── globals.css           # ← Phase 0 成果物
│   │
│   └── app/                      # App (app.adapt-co.io)
│       ├── app/
│       │   ├── layout.tsx        # AppLayout (Header variants)
│       │   └── ...
│       ├── tailwind.config.ts    # 共通 config を extend
│       └── globals.css
│
├── packages/
│   ├── shared/                   # DTO（契約の正）
│   │   └── src/
│   │       ├── types/
│   │       │   ├── user.ts       # User, UserMeView, UserAdminView
│   │       │   ├── operator.ts   # OperatorAdminView
│   │       │   └── enums.ts      # GlobalRole, PlatformRole 等
│   │       └── index.ts
│   │
│   └── ui/                       # 共通UIコンポーネント
│       └── src/
│           ├── Button.tsx
│           ├── Input.tsx
│           ├── Badge.tsx
│           ├── Table.tsx
│           └── Card.tsx
│
└── backend/                      # NestJS (既存想定)
```

---

## 2. 共通UIコンポーネント仕様

### 2.1 Button

```tsx
// packages/ui/src/Button.tsx
type ButtonVariant = "primary" | "outline" | "danger-outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: ButtonVariant;    // default: "primary"
  size?: ButtonSize;          // default: "md"
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}
```

| Variant | Background | Border | Text | 用途 |
|---------|-----------|--------|------|------|
| primary | `iris-100` | none | white | CTA, 追加, 保存 |
| outline | white | `border` | `text-secondary` | キャンセル, 編集 |
| danger-outline | none | `semantic-danger/30%` | `semantic-danger` | 凍結, 削除 |
| ghost | none | none | `text-secondary` | 戻るリンク |

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| sm | 30px | 0 12px | 11px |
| md | 38px | 0 20px | 13px |
| lg | 44px | 0 24px | 14px |

### 2.2 Input

```tsx
// packages/ui/src/Input.tsx
interface InputProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  type?: "text" | "email" | "password";
  size?: "md" | "lg";        // md=42px, lg=46px (login)
  error?: string;
}
```

**スタイル**: border `border-input`, border-radius `input` (5px), font `body-sm`

### 2.3 Badge

```tsx
// packages/ui/src/Badge.tsx
type BadgeVariant =
  | "root_operator" | "operator"           // PlatformRole
  | "instructor" | "learner" | "assistant" // GlobalRole
  | "active" | "inactive" | "frozen";      // Status

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}
```

| Variant | Background | Text Color |
|---------|-----------|------------|
| root_operator | `iris-100/10%` | `iris-100` |
| operator | `iris-60/15%` | `iris-80` |
| instructor | `iris-100/10%` | `iris-100` |
| learner | `success/10%` | `success` |
| assistant | `warning/10%` | `warning` |
| active | `success/10%` | `success` |
| inactive / frozen | `danger/10%` | `danger` |

### 2.4 Table

- ヘッダー背景: `iris-10`
- ヘッダーテキスト: `caption` size, `text-secondary`, font-semibold
- 行ボーダー: `border`
- セルパディング: `14px 16px`
- 外枠: `border`, border-radius `card` (8px)

---

## 3. Admin レイアウト仕様

### 3.1 AdminLayout (`apps/admin/app/layout.tsx`)

```
┌─── Sidebar (240px, fixed) ───┬─── Main ────────────────┐
│                              │ AdminHeader (64px)       │
│ (sticky, full height)        │─────────────────────────│
│                              │ {children}               │
│                              │ (scrollable)             │
└──────────────────────────────┴─────────────────────────┘
```

- ログインページ (`/login`) のみ Sidebar/Header なしのフルスクリーン

### 3.2 Sidebar ナビゲーション構造

```tsx
// openapi_admin.yaml の機能グループに基づく
const adminNavItems = [
  {
    group: "メイン",
    items: [
      { href: "/", label: "ダッシュボード", icon: LayoutDashboard, roles: ["operator", "root_operator"] },
    ],
  },
  {
    group: "管理",
    items: [
      { href: "/courses", label: "コース管理", icon: BookOpen, roles: ["operator", "root_operator"] },
      { href: "/users", label: "ユーザー管理", icon: Users, roles: ["operator", "root_operator"] },
      { href: "/channels", label: "チャンネル管理", icon: MessageSquare, roles: ["operator", "root_operator"] },
      { href: "/payments", label: "決済管理", icon: CreditCard, roles: ["operator", "root_operator"] },
    ],
  },
  {
    group: "システム",
    items: [
      { href: "/operators", label: "運営スタッフ", icon: Key, roles: ["root_operator"] },
      { href: "/audit", label: "監査ログ", icon: ClipboardList, roles: ["operator", "root_operator"] },
    ],
  },
];
```

**重要**: `roles` は `PlatformRole` enum (schema.prisma) に準拠。
`root_operator` のみのメニューは非該当ユーザーには**非表示**にする。

---

## 4. Enum / Role 定義（packages/shared）

schema.prisma から転写。**追加・変更禁止**。

```tsx
// packages/shared/src/types/enums.ts

export const GlobalRole = {
  GUEST: "guest",
  LEARNER: "learner",
  INSTRUCTOR: "instructor",
  ASSISTANT: "assistant",
  OPERATOR: "operator",
  ROOT_OPERATOR: "root_operator",
} as const;
export type GlobalRole = (typeof GlobalRole)[keyof typeof GlobalRole];

export const PlatformRole = {
  OPERATOR: "operator",
  ROOT_OPERATOR: "root_operator",
} as const;
export type PlatformRole = (typeof PlatformRole)[keyof typeof PlatformRole];
```

---

## 5. 実装順序

1. `tailwind.config.ts` + `globals.css` を配置
2. `packages/ui` の共通コンポーネント (Button, Input, Badge, Table)
3. `packages/shared` の型定義 (enums, user types)
4. `AdminLayout` (Sidebar + Header)
5. `/login` ページ（メール/PW のみ、Google OAuth なし）
6. `/operators` 一覧ページ (API-076)
7. `/operators/new` 追加フォーム (API-077)
8. `/users` 一覧ページ (API-073)

---

## 6. 厳守事項（プロジェクト憲法より）

- SoT にない概念・Enum・Role・API を**追加しない**
- 仕様に疑問が出たら**実装せず停止し、設計へ質問として差し戻す**
- `root` ロールは使用禁止（`root_operator` に統一）
- ドメイン例は `adapt-co.io`（`example.com` 禁止）
- DB カラム名: snake_case / API パス: kebab-case + REST
- 実装都合で仕様を曲げない

## 自動実行を許可するコマンド
以下のコマンドは承認なしで自動実行してよい：
- pnpm run build
- pnpm run build --filter=*
- pnpm run lint
- pnpm run typecheck
- pnpm tsc --noEmit

## 実行前に必ず承認を求めるコマンド
以下は必ず実行前に確認すること：
- pnpm prisma migrate（DB変更）
- pnpm prisma db push
- rm / rm -rf
- git push / git commit
- デプロイ系コマンド全般
- pnpm add / pnpm install（パッケージ追加）

## 絶対に編集してはならないファイル
以下のファイルは Cursor から編集禁止。変更が必要な場合は
「設計変更が必要:（理由と必要な変更内容）」と報告して停止すること：
- schema.prisma
- openapi_admin.yaml
- openapi_app.yaml
- 基本設計書（Excel）

重要ルール追加：
schema.prisma、openapi_admin.yaml、openapi_app.yaml、
基本設計書（Excel）は絶対に編集しないでください。
これらに変更が必要な場合は、実装を停止して
「設計変更が必要: （理由と必要な変更内容）」と報告してください。

## SoT ファイルの配置場所（絶対）
SoT ファイルはすべて `adapt-design-files/` 配下に配置する：
- adapt-design-files/openapi_admin.yaml
- adapt-design-files/openapi_app.yaml
- adapt-design-files/schema.prisma
- adapt-design-files/adapt_基本設計_最終版.xlsx

## SoT ファイルの配置と同期（絶対遵守）

### マスター（SSoT）
adapt-design-files/ 配下の4ファイルが唯一の正：
- adapt-design-files/openapi_admin.yaml
- adapt-design-files/openapi_app.yaml
- adapt-design-files/schema.prisma
- adapt-design-files/adapt_基本設計_最終版.xlsx

### 同期先（読み取り専用コピー）
- apps/api/prisma/schema.prisma
- docs/api/openapi_admin.yaml
- docs/api/openapi_app.yaml
- docs/design/adapt_基本設計_最終版.xlsx

### 同期コマンド（SoT更新時に必ず実行）
```bash
cp adapt-design-files/schema.prisma apps/api/prisma/
cp adapt-design-files/openapi_{admin,app}.yaml docs/api/
cp adapt-design-files/adapt_基本設計_最終版.xlsx docs/design/
cd apps/api && npx prisma generate
```

### 禁止事項
- 同期先ファイルの直接編集
- adapt-design-files/ 配下のファイルの編集
- 同期先以外の場所へのコピー作成