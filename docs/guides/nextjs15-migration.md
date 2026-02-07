# Next.js 15 対応ガイド

## 主な変更点

### 1. params/searchParams が Promise 型

Next.js 15 では、ページコンポーネントの `params` と `searchParams` が `Promise` 型になりました。

```typescript
// Next.js 15 (新)
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // await が必須
}

// Next.js 14 (旧) - 動作しない
export default function Page({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
}
```

### 2. cookies()/headers() が async 関数

```typescript
// Next.js 15 (新)
import { cookies, headers } from 'next/headers';

const cookieStore = await cookies(); // await が必須
const token = cookieStore.get('token');

const headersList = await headers(); // await が必須
const userAgent = headersList.get('user-agent');
```

### 3. fetch() のキャッシュがデフォルト no-cache

```typescript
// 静的データ - 明示的にキャッシュ
const data = await fetch(url, { cache: 'force-cache' });

// 定期更新データ - revalidate 指定
const data = await fetch(url, { next: { revalidate: 60 } });

// 動的データ - デフォルト (no-cache) で OK
const data = await fetch(url);
```

### 4. React 19 対応

- React 19 が必須
- 新しいフック（useOptimistic, useFormStatus 等）が利用可能

### 5. Turbopack

開発環境では `--turbo` フラグで Turbopack を使用:

```bash
next dev --turbo
```

## 参照

- [Next.js 15 Blog Post](https://nextjs.org/blog/next-15)
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
