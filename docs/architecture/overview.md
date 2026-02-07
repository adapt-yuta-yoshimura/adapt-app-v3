# アーキテクチャ概要

## システム構成

```
┌──────────────┐  ┌──────────────┐
│  Web App     │  │  Admin App   │
│  (Next.js 15)│  │  (Next.js 15)│
│  :3000       │  │  :3001       │
└──────┬───────┘  └──────┬───────┘
       │                  │
       └────────┬─────────┘
                │
       ┌────────▼─────────┐
       │  API Server       │
       │  (NestJS)         │
       │  :4000            │
       └────────┬─────────┘
                │
       ┌────────▼─────────┐
       │  PostgreSQL 16    │
       │  :5432            │
       └──────────────────┘
```

## レイヤーアーキテクチャ

```
Controller (薄い層)
    ↓ HTTP リクエスト/レスポンス処理のみ
UseCase (厚い層)
    ↓ ビジネスロジック、Prisma 非依存
Repository (Prisma のみ)
    ↓ DB 操作、Prisma を完全隠蔽
Prisma Client
    ↓
PostgreSQL
```

## モノレポ構成

| パッケージ | 説明 |
|-----------|------|
| apps/api | NestJS API サーバー |
| apps/web | Next.js 15 Web アプリ |
| apps/admin | Next.js 15 管理画面 |
| packages/shared | 共有型定義・Zod スキーマ |
| packages/ui | UI コンポーネントライブラリ |
| packages/types | OpenAPI 生成型 |
| packages/eslint-config | ESLint 設定 |
| packages/typescript-config | TypeScript 設定 |

## データベース

- 27 モデル
- 18 Enum
- 詳細は `apps/api/prisma/schema.prisma` を参照
