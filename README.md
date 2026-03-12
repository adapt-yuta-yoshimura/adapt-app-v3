# adapt v1.0

コース型EdTech SaaS - 講座販売・受講・課題・チャット統合型学習プラットフォーム

## Tech Stack

### Backend
- **Framework**: NestJS 10.3+
- **ORM**: Prisma 7.4+
- **Database**: PostgreSQL 16
- **Cache**: Redis 7

### Frontend
- **Framework**: **Next.js 15.0+** (App Router)
- **UI Library**: **React 19.0+**
- **State Management**: TanStack Query 5.17+
- **Styling**: Tailwind CSS 3.4+ / shadcn/ui

### Monorepo
- **Tool**: Turborepo + pnpm workspace
- **Package Manager**: pnpm 8+

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start Docker services:
   ```bash
   docker-compose up -d
   ```

3. Setup hosts file:
   ```bash
   sudo bash scripts/setup-hosts.sh
   ```

4. Generate OpenAPI types:
   ```bash
   pnpm generate:types
   ```

5. Setup database:
   ```bash
   cd apps/api
   pnpm prisma migrate dev --name init
   pnpm prisma generate
   ```

6. Seed development data (creates test users for each role):
   ```bash
   pnpm db:seed
   ```

7. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

8. Start development servers:
   ```bash
   pnpm dev
   ```

### Access

- Web App: http://app.localhost.adapt:3000
- Admin: http://admin.localhost.adapt:3001
- API: http://app.localhost.adapt:4000

## Next.js 15 の重要な変更点

### 1. params/searchParams が Promise型
```typescript
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // await必須
}
```

### 2. cookies()/headers() が async関数
```typescript
const cookieStore = await cookies(); // await必須
const token = cookieStore.get('token');
```

### 3. fetch() のキャッシュがデフォルト no-cache
```typescript
// キャッシュが必要な場合は明示的に指定
const data = await fetch(url, { cache: 'force-cache' });
const data = await fetch(url, { next: { revalidate: 60 } });
```

詳細は [docs/guides/nextjs15-migration.md](docs/guides/nextjs15-migration.md) を参照

## Project Structure

See [docs/architecture/overview.md](docs/architecture/overview.md)

### Backend Modules (`apps/api/src/modules/`)

| モジュール | 説明 |
|-----------|------|
| admin-course | 管理画面：コース管理 |
| admin-dashboard | 管理画面：ダッシュボード |
| admin-operator | 管理画面：運営者管理 |
| admin-payment | 管理画面：決済管理 |
| admin-user | 管理画面：ユーザー管理 |
| audit | 監査ログ |
| auth-identity | 認証・ID管理 |
| communication | チャット・通知 |
| enrollment | 受講登録 |
| instructor-course | 講師：コース管理 |
| instructor-operations | 講師：運用操作 |
| learner | 受講者機能 |
| store | ストア（講座一覧・購入） |
| user | ユーザープロフィール・設定 |

## Documentation

- [Development Guide](docs/guides/development.md)
- [Deployment Guide](docs/guides/deployment.md)
- [Next.js 15 Migration Guide](docs/guides/nextjs15-migration.md)
- [API Documentation](docs/api/)

### SoT（設計原本）

- [OpenAPI 仕様（App）](docs/api/openapi_app.yaml)
- [OpenAPI 仕様（Admin）](docs/api/openapi_admin.yaml)
- [DB スキーマ](docs/api/schema.prisma)
- [基本設計書](docs/design/adapt_基本設計_最終版.xlsx)
