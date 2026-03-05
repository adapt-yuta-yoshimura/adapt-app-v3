import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:4000';

/**
 * Admin API BFF プロキシ
 * クッキー admin_token を Authorization: Bearer に載せてバックエンドへ転送
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxy('GET', context.params, request);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxy('POST', context.params, request);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxy('PATCH', context.params, request);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxy('DELETE', context.params, request);
}

async function proxy(
  method: string,
  params: Promise<{ path: string[] }>,
  request?: NextRequest
) {
  const { path } = await params;
  const pathStr = path.join('/');
  const search = request ? new URL(request.url).search : '';
  const url = `${API_BASE_URL}/${pathStr}${search}`;

  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  const targetUrl = `${API_BASE_URL}/${pathStr}`;
  console.log('[BFF proxy]', { pathStr, hasToken: !!token, targetUrl });
  if (!token) {
    console.log('[BFF proxy] no token in cookies');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const init: RequestInit = {
    method,
    headers,
  };

  if (request && (method === 'POST' || method === 'PATCH')) {
    try {
      const body = await request.text();
      if (body) init.body = body;
    } catch {
      // no body
    }
  }

  const res = await fetch(url, init);
  const data = await res.text();
  const contentType = res.headers.get('content-type') ?? 'application/json';

  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': contentType },
  });
}
