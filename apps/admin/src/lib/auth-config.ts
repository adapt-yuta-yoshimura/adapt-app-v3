/**
 * OIDC 設定・PKCE・トークン交換・refresh・JWT デコード・logout URL
 * Keycloak Authorization Code Flow + PKCE (S256)、Web Crypto API のみ使用
 */

const ISSUER = process.env.NEXT_PUBLIC_OIDC_ISSUER_URL ?? '';
const CLIENT_ID = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID ?? '';
const REDIRECT_URI = process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI ?? '';

const AUTH_PATH = '/protocol/openid-connect/auth';
const TOKEN_PATH = '/protocol/openid-connect/token';
const LOGOUT_PATH = '/protocol/openid-connect/logout';

export interface OidcConfig {
  issuerUrl: string;
  clientId: string;
  redirectUri: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  endSessionEndpoint: string;
}

/**
 * OIDC 設定定数を返す（環境変数から取得）
 */
export function getOidcConfig(): OidcConfig {
  const issuerUrl = ISSUER.replace(/\/$/, '');
  return {
    issuerUrl,
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    authorizationEndpoint: `${issuerUrl}${AUTH_PATH}`,
    tokenEndpoint: `${issuerUrl}${TOKEN_PATH}`,
    endSessionEndpoint: `${issuerUrl}${LOGOUT_PATH}`,
  };
}

/**
 * ランダムバイトを base64url エンコード（末尾 = は省略）
 */
function base64UrlEncode(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * PKCE code_verifier 生成（43〜128 文字、[A-Za-z0-9-._~]）
 */
export function generateCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    throw new Error('Crypto.getRandomValues not available');
  }
  return base64UrlEncode(bytes);
}

/**
 * PKCE code_challenge = base64url(sha256(code_verifier))
 * crypto.subtle はセキュアコンテキスト（HTTPS または localhost）でのみ利用可能
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const cryptoApi =
    typeof window !== 'undefined' ? window.crypto : (globalThis as { crypto?: Crypto }).crypto;
  const subtle = cryptoApi?.subtle;
  if (!subtle || typeof subtle.digest !== 'function') {
    throw new Error(
      'PKCE に必要な crypto.subtle が利用できません。HTTPS または http://localhost:3001 でアクセスしてください。',
    );
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

/**
 * state 用ランダム文字列
 */
export function generateState(): string {
  const bytes = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    globalThis.crypto.getRandomValues(bytes);
  }
  return base64UrlEncode(bytes);
}

/**
 * nonce 用ランダム文字列
 */
export function generateNonce(): string {
  return generateState();
}

/**
 * 認可 URL を構築（state, nonce, code_challenge を付与）
 */
export function buildAuthorizationUrl(params: {
  state: string;
  nonce: string;
  codeChallenge: string;
}): string {
  const config = getOidcConfig();
  const params_ = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid',
    state: params.state,
    nonce: params.nonce,
    code_challenge: params.codeChallenge,
    code_challenge_method: 'S256',
  });
  return `${config.authorizationEndpoint}?${params_.toString()}`;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
}

/**
 * 認可コードをトークンに交換
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
): Promise<TokenResponse> {
  const config = getOidcConfig();
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  const res = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  return (await res.json()) as TokenResponse;
}

let refreshPromise: Promise<TokenResponse | null> | null = null;

/**
 * リフレッシュトークンでアクセストークン更新（single-flight 多重抑止）
 * invalid_grant 時は null を返す（呼び出し側でログアウトすること）
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse | null> {
  if (refreshPromise !== null) {
    return refreshPromise;
  }

  refreshPromise = (async (): Promise<TokenResponse | null> => {
    try {
      const config = getOidcConfig();
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.clientId,
        refresh_token: refreshToken,
      });

      const res = await fetch(config.tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        if (data.error === 'invalid_grant') {
          return null;
        }
        const text = await res.text();
        throw new Error(`Refresh failed: ${res.status} ${text}`);
      }

      return (await res.json()) as TokenResponse;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * JWT の payload をデコード（署名検証は行わない・payload のみ）
 */
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }
  const payload = parts[1];
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const decoded = atob(padded);
  return JSON.parse(decodeURIComponent(escape(decoded))) as T;
}

/**
 * realm_roles から PlatformRole 相当の role を決定（固定ルール）
 * - 'root_operator' が含まれていれば 'root_operator'
 * - 次に 'operator' が含まれていれば 'operator'
 * - それ以外は realmRoles[0]、無ければ 'unknown'
 */
export function resolveRoleFromRealmRoles(realmRoles: string[] | undefined): string {
  if (!realmRoles || realmRoles.length === 0) {
    return 'unknown';
  }
  if (realmRoles.includes('root_operator')) {
    return 'root_operator';
  }
  if (realmRoles.includes('operator')) {
    return 'operator';
  }
  return realmRoles[0] ?? 'unknown';
}

export interface IdTokenPayload {
  sub?: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  nonce?: string;
  realm_roles?: string[];
  [key: string]: unknown;
}

/**
 * id_token payload から Admin 用ユーザー情報を抽出（realm_roles は固定パス）
 */
export function userFromIdTokenPayload(payload: IdTokenPayload): {
  id: string;
  email: string;
  displayName: string;
  role: string;
} {
  const sub = payload.sub ?? '';
  const email = payload.email ?? payload.preferred_username ?? '';
  const displayName =
    payload.name ?? ([payload.given_name, payload.family_name].filter(Boolean).join(' ') || email);
  const role = resolveRoleFromRealmRoles(payload.realm_roles);
  return { id: sub, email, displayName, role };
}

/**
 * ログアウト URL（end_session_endpoint）を構築
 * id_token_hint と post_logout_redirect_uri を付与可能
 */
export function buildLogoutUrl(params?: {
  idTokenHint?: string;
  postLogoutRedirectUri?: string;
}): string {
  const config = getOidcConfig();
  const search = new URLSearchParams();
  if (params?.idTokenHint) {
    search.set('id_token_hint', params.idTokenHint);
  }
  if (params?.postLogoutRedirectUri) {
    search.set('post_logout_redirect_uri', params.postLogoutRedirectUri);
  }
  const query = search.toString();
  return query ? `${config.endSessionEndpoint}?${query}` : config.endSessionEndpoint;
}
