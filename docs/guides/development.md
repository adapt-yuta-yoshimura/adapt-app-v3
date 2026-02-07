# 開発ガイド

## 開発環境のセットアップ

### 前提条件

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### 初期セットアップ

1. リポジトリをクローン
2. 依存関係をインストール: `pnpm install`
3. Docker サービスを起動: `docker-compose up -d`
4. hosts ファイルを設定: `sudo bash scripts/setup-hosts.sh`
5. 環境変数を設定: `cp .env.example .env`
6. データベースをセットアップ:
   ```bash
   cd apps/api
   pnpm prisma migrate dev --name init
   pnpm prisma generate
   ```
7. OpenAPI型を生成: `pnpm generate:types`
8. 開発サーバーを起動: `pnpm dev`

### 開発サーバー

| アプリ | URL | ポート |
|--------|-----|--------|
| Web App | http://app.localhost.adapt:3000 | 3000 |
| Admin | http://admin.localhost.adapt:3001 | 3001 |
| API | http://app.localhost.adapt:4000 | 4000 |

### コーディング規約

CLAUDE.MD を参照してください。

### テスト

```bash
pnpm test        # 全テスト実行
pnpm test --filter=@adapt/api  # API テストのみ
```
