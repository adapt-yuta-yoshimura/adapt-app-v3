# adapt v1.0

コース型EdTech SaaS - 講座販売・受講・課題・チャット統合型学習プラットフォーム

## Tech Stack

### Backend
- **Framework**: NestJS 10.3+
- **ORM**: Prisma 5.8+
- **Database**: PostgreSQL 16
- **WebSocket**: Socket.IO 4.6+
- **Cache**: Redis 7

### Frontend
- **Framework**: **Next.js 15.0+** (App Router)
- **UI Library**: **React 19.0+**
- **State Management**: TanStack Query 5.17+ / Zustand 4.4+
- **Styling**: Tailwind CSS 3.4+ / shadcn/ui
- **Dev Tool**: **Turbopack** (開発環境)

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

6. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

7. Start development servers (with Turbopack):
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

## Documentation

- [Development Guide](docs/guides/development.md)
- [Deployment Guide](docs/guides/deployment.md)
- [Next.js 15 Migration Guide](docs/guides/nextjs15-migration.md)
- [API Documentation](docs/api/)
