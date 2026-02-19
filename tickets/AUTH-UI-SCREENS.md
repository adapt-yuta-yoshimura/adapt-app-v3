# AUTH-UI-01 / AUTH-UI-02: Keycloak パスワードリセット画面（参照）

## 基本情報
- **種別**: 参照画面定義（auth.adapt-co.io 管理）
- **App/Admin側実装**: なし（リンク導線のみ）
- **認証基盤**: Keycloak（OIDC IdP）

## 画面定義

### AUTH-UI-01: パスワードリセット申請画面
- **URL**: auth.adapt-co.io/realms/adapt/login-actions/reset-credentials
- **入力**: メールアドレス
- **操作**: リセットメール送信
- **表示制御**: アカウント有無を明示しないメッセージ
- **管理**: Keycloak テーマカスタマイズで対応

### AUTH-UI-02: パスワード再設定画面
- **URL**: auth.adapt-co.io/realms/adapt/login-actions/action-token
- **遷移元**: リセットメール内リンク（token付き）
- **入力**: 新しいパスワード / 新しいパスワード（確認）
- **制御**:
  - token 有効期限: 24時間
  - ワンタイム利用（成功後は即失効）
  - 無効/期限切れの場合は「再発行へ誘導」
- **完了後**: ログイン画面へ遷移
- **管理**: Keycloak テーマカスタマイズで対応

## App 側導線

| App 画面 | 操作 | 遷移先 |
|---|---|---|
| PG-002（ログイン） | 「パスワードを忘れた場合」リンク | AUTH-UI-01 |
| PG-004（パスワードリセット） | リダイレクト | AUTH-UI-01 |
| AUTH-UI-01 | メール送信後、メール内リンク | AUTH-UI-02 |
| AUTH-UI-02 | パスワード再設定完了 | PG-002（ログイン画面） |

## 既存 API との関係

| API | 用途 | 変更 |
|---|---|---|
| API-003 PUT /api/v1/users/me/password | ログイン済みユーザーのパスワード変更 | 変更なし |

- API-003 は **ログイン済みパスワード変更**（STU-UI-12 アカウント設定から利用）
- パスワード **リセット**（未ログイン状態）は Keycloak が処理するため App API は不要

## OpenAPI / DB 変更
- openapi_app.yaml: 変更なし
- openapi_admin.yaml: 変更なし
- schema.prisma: 変更なし
- PasswordResetToken モデル追加: 禁止

## Keycloak 設定タスク（インフラ／DevOps担当）

以下は Claude Code / Cursor のスコープ外。インフラ担当が対応する。

- [ ] Keycloak realm 設定: パスワードリセットメール有効化
- [ ] token 有効期限: 24時間（86400秒）に設定
- [ ] メールテンプレート: リセットメールのカスタマイズ
- [ ] テーマ: パスワードリセット画面の日本語化・ブランドカスタマイズ
- [ ] セキュリティ: アカウント列挙防止（ユーザー存在有無を非開示）

## 受け入れ基準
- [ ] 基本設計書 07_画面一覧に AUTH-UI-01, AUTH-UI-02 が存在する
- [ ] 02_機能要件 AUTH-05 の関連画面・備考が更新されている
- [ ] App側ログイン画面に導線コメントが存在する（ファイルが存在する場合）
- [ ] OpenAPI / Prisma に差分がないことを確認済み
