#!/bin/bash
# Keycloak クライアント設定スクリプト
# lightweight access token を無効化して sub クレームを含める

set -e

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
REALM="${REALM:-adapt}"
ADMIN_USER="${KEYCLOAK_ADMIN:-admin}"
ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin}"

echo "Waiting for Keycloak to be ready..."
until curl -sf "${KEYCLOAK_URL}/realms/${REALM}/.well-known/openid-configuration" > /dev/null 2>&1; do
  echo "Keycloak is not ready yet. Waiting..."
  sleep 5
done

echo "Keycloak is ready. Obtaining admin token..."

# master realm から admin トークンを取得
ADMIN_TOKEN=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${ADMIN_USER}" \
  -d "password=${ADMIN_PASSWORD}" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" \
  | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

if [ -z "$ADMIN_TOKEN" ]; then
  echo "Failed to obtain admin token"
  exit 1
fi

echo "Admin token obtained successfully"

# クライアントリストを取得して、各クライアントを更新
for CLIENT_ID in "adapt-admin" "adapt-app"; do
  echo "Configuring client: ${CLIENT_ID}"

  # クライアントの内部IDを取得
  CLIENT_UUID=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM}/clients" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    | grep -o "\"id\":\"[^\"]*\",\"clientId\":\"${CLIENT_ID}\"" | head -1 | grep -o '"id":"[^"]*' | sed 's/"id":"//')

  if [ -z "$CLIENT_UUID" ]; then
    echo "Client ${CLIENT_ID} not found. Skipping..."
    continue
  fi

  echo "Found client ${CLIENT_ID} with UUID: ${CLIENT_UUID}"

  # 現在のクライアント設定を取得
  CLIENT_CONFIG=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${CLIENT_UUID}" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}")

  # attributes に use.lightweight.access.token.enabled = false を設定
  UPDATED_CONFIG=$(echo "$CLIENT_CONFIG" | python3 -c "
import sys, json
config = json.load(sys.stdin)
if 'attributes' not in config:
    config['attributes'] = {}
config['attributes']['use.lightweight.access.token.enabled'] = 'false'
print(json.dumps(config))
")

  # クライアント設定を更新
  curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${CLIENT_UUID}" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$UPDATED_CONFIG"

  echo "Client ${CLIENT_ID} updated successfully"
done

echo ""
echo "=== Verification ==="
echo "Testing token for root@adapt-co.io..."

# アクセストークンを取得して sub の存在を確認
TOKEN=$(curl -s -X POST "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
  -d "client_id=adapt-admin" \
  -d "grant_type=password" \
  -d "username=root@adapt-co.io" \
  -d "password=root1234" \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
  echo "Failed to obtain access token for verification"
  exit 1
fi

echo "$TOKEN" | cut -d. -f2 | python3 -c "
import sys, base64, json
payload = sys.stdin.read().strip()
# Base64 padding を追加
payload += '=' * ((4 - len(payload) % 4) % 4)
decoded = json.loads(base64.urlsafe_b64decode(payload))
print('sub:', decoded.get('sub', 'NOT FOUND'))
print('email:', decoded.get('email', 'NOT FOUND'))
print('realm_roles:', decoded.get('realm_roles', 'NOT FOUND'))
"

echo ""
echo "Configuration completed successfully!"
