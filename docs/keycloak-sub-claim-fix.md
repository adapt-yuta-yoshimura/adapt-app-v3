# Keycloak 26 アクセストークン sub クレーム修正

## 問題

Keycloak 26.0.8 では **lightweight access token** がデフォルトで有効になっており、アクセストークンから `sub`, `email`, `preferred_username` などの標準クレームが除外される。

- **IDトークン**: `sub` が正常に含まれる ✅
- **アクセストークン**: `sub` が含まれない ❌

これにより、NestJS バックエンドの `jwt.strategy.ts` が `sub` クレームを必須とするため、認証が失敗する。

---

## 根本原因

Keycloak 26 では、以下の2つの問題がある：

1. **Lightweight access token**: デフォルトで有効になり、標準クレームが削除される
2. **クライアントスコープのマッパー削除**: `profile`, `email` などのビルトインスコープから protocol mapper が削除されている

`realm-export.json` で `use.lightweight.access.token.enabled: "false"` を設定しても、インポート時に無視される。

---

## 解決策

`realm-export.json` の **クライアント直下の `protocolMappers`** に以下のマッパーを追加：

- `sub` (oidc-sub-mapper)
- `email` (oidc-usermodel-property-mapper)
- `preferred_username` (oidc-usermodel-property-mapper)
- `given_name` (oidc-usermodel-property-mapper)
- `family_name` (oidc-usermodel-property-mapper)

これにより、アクセストークンに必要なクレームが含まれるようになる。

---

## 修正内容

### 修正ファイル

- `keycloak/realm-export.json`

### 追加したマッパー（adapt-admin / adapt-app 両方）

```json
{
  "name": "username",
  "protocol": "openid-connect",
  "protocolMapper": "oidc-usermodel-property-mapper",
  "config": {
    "userinfo.token.claim": "true",
    "user.attribute": "username",
    "id.token.claim": "true",
    "access.token.claim": "true",
    "claim.name": "preferred_username",
    "jsonType.label": "String"
  }
},
{
  "name": "email",
  "protocol": "openid-connect",
  "protocolMapper": "oidc-usermodel-property-mapper",
  "config": {
    "userinfo.token.claim": "true",
    "user.attribute": "email",
    "id.token.claim": "true",
    "access.token.claim": "true",
    "claim.name": "email",
    "jsonType.label": "String"
  }
},
{
  "name": "given name",
  "protocol": "openid-connect",
  "protocolMapper": "oidc-usermodel-property-mapper",
  "config": {
    "userinfo.token.claim": "true",
    "user.attribute": "firstName",
    "id.token.claim": "true",
    "access.token.claim": "true",
    "claim.name": "given_name",
    "jsonType.label": "String"
  }
},
{
  "name": "family name",
  "protocol": "openid-connect",
  "protocolMapper": "oidc-usermodel-property-mapper",
  "config": {
    "userinfo.token.claim": "true",
    "user.attribute": "lastName",
    "id.token.claim": "true",
    "access.token.claim": "true",
    "claim.name": "family_name",
    "jsonType.label": "String"
  }
},
{
  "name": "sub",
  "protocol": "openid-connect",
  "protocolMapper": "oidc-sub-mapper",
  "config": {
    "introspection.token.claim": "true",
    "userinfo.token.claim": "true",
    "id.token.claim": "true",
    "access.token.claim": "true"
  }
}
```

---

## 検証方法

### 1. Keycloak 再構築

```bash
# Keycloak と既存データを削除
docker compose down keycloak
docker exec -i adapt-postgres psql -U adapt -d adapt -c "DROP SCHEMA IF EXISTS keycloak CASCADE;"
docker exec -i adapt-postgres psql -U adapt -d adapt -c "CREATE SCHEMA IF NOT EXISTS keycloak;"

# Keycloak を起動
docker compose up -d keycloak

# 起動を待機
sleep 40
```

### 2. トークン検証

```bash
# アクセストークンを取得
TOKEN=$(curl -s -X POST http://localhost:8080/realms/adapt/protocol/openid-connect/token \
  -d "client_id=adapt-admin" -d "grant_type=password" \
  -d "username=root@adapt-co.io" -d "password=root1234" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# トークンペイロードをデコード
echo $TOKEN | cut -d. -f2 | python3 -c "
import sys,base64,json
p=sys.stdin.read().strip()
p+='='*((4-len(p)%4)%4)
d=json.loads(base64.urlsafe_b64decode(p))
print('sub:', d.get('sub','NOT FOUND'))
print('email:', d.get('email','NOT FOUND'))
print('realm_roles:', d.get('realm_roles','NOT FOUND'))
"
```

### 期待結果

```
sub: d4233c7f-26ab-4d20-81ea-f46035427570
email: root@adapt-co.io
realm_roles: ['root_operator']
```

---

## 完了条件

- [x] `adapt-admin` のアクセストークンに `sub`, `email` が含まれる
- [x] `adapt-app` のアクセストークンに `sub`, `email` が含まれる
- [x] `realm_roles` が引き続き含まれる
- [x] Keycloak 再構築（volume削除→up）で再現性がある
- [x] `jwt.strategy.ts` の `validate()` で 401 にならない

---

## 参考情報

- Keycloak 26 では lightweight access token がデフォルト有効
- `use.lightweight.access.token.enabled: "false"` はクライアント属性で設定しても、インポート時に無視される
- 解決策: クライアント直下の `protocolMappers` に必要なマッパーを明示的に追加
- Keycloak Admin REST API で設定を確認可能：
  ```bash
  curl -s -X GET "http://localhost:8080/admin/realms/adapt/clients/{client-uuid}" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}"
  ```
