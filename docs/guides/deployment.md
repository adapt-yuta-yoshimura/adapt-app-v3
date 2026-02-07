# デプロイガイド

## 環境

| 環境 | ドメイン |
|------|----------|
| 本番 (App) | app.adapt-co.io |
| 本番 (Admin) | admin.adapt-co.io |
| 本番 (Auth) | auth.adapt-co.io |

## デプロイフロー

TODO(ADAPT): デプロイフローを定義

## 環境変数

本番環境の環境変数は `.env.example` を参照し、適切な値を設定してください。

### 重要な注意事項

- `JWT_SECRET` は必ず本番用の強力なシークレットに変更
- `DATABASE_URL` は本番データベースの接続文字列に変更
- Stripe キーは本番キーに変更
