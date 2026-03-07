import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * OIDC コールバック（Route Handler）
 * GET ?code=xxx を受け取り、トークンエンドポイントで access_token を取得してクッキーに保存し /admin/dashboard へリダイレクト
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const errorParam = searchParams.get('error');
  const code = searchParams.get('code');

  if (errorParam) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorParam)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  const issuer = process.env.NEXT_PUBLIC_AUTH_ISSUER ?? 'https://auth.adapt-co.io/realms/adapt';
  const clientId = process.env.NEXT_PUBLIC_AUTH_CLIENT_ID ?? 'admin';
  const clientSecret = process.env.AUTH_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';
  const redirectUri = `${appUrl}/callback`;

  const tokenUrl = `${issuer}/protocol/openid-connect/token`;
  const state = searchParams.get('state');
  const codeVerifier = state ?? '';
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    ...(codeVerifier ? { code_verifier: codeVerifier } : {}),
    ...(clientSecret ? { client_secret: clientSecret } : {}),
  });

  const tokenRes = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!tokenRes.ok) {
    const errorBody = await tokenRes.text();
    console.error('[callback] token exchange failed', {
      status: tokenRes.status,
      tokenUrl,
      redirectUri,
      clientId,
      codeVerifier: codeVerifier ? codeVerifier.substring(0, 10) + '...' : 'empty',
      errorBody,
    });
    return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
  }

  const tokenData = (await tokenRes.json()) as {
    access_token?: string;
    id_token?: string;
  };

  const accessToken = tokenData.access_token;
  if (!accessToken) {
    return NextResponse.redirect(new URL('/login?error=no_access_token', request.url));
  }

  const payload = decodeJwtPayload(accessToken);
  const hasRootRole =
    payload?.realm_access && Array.isArray((payload.realm_access as { roles?: string[] }).roles)
      ? (payload.realm_access as { roles: string[] }).roles.includes('root_operator')
      : false;
  const globalRole = hasRootRole ? 'root_operator' : 'operator';
  const userName =
    (typeof payload?.name === 'string' ? payload.name : null) ??
    (typeof payload?.preferred_username === 'string' ? payload.preferred_username : null);

  const cookieStore = await cookies();
  const cookieOpts = {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 8,
  };

  cookieStore.set('admin_token', accessToken, cookieOpts);
  cookieStore.set('admin_role', globalRole, cookieOpts);
  if (userName) {
    cookieStore.set('admin_user_name', userName, cookieOpts);
  }

  // returnUrl: ログイン前の遷移先を復元（Cookie から取得して削除）
  const returnUrl = cookieStore.get('admin_return_url')?.value;
  cookieStore.delete('admin_return_url');

  // returnUrl の安全性チェック: /admin/ で始まるパスのみ許可（オープンリダイレクト防止）
  const redirectPath =
    returnUrl && returnUrl.startsWith('/admin/')
      ? returnUrl
      : '/admin/dashboard';

  return NextResponse.redirect(new URL(redirectPath, request.url));
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}
