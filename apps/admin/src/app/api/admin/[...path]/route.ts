import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:4000';

/**
 * Admin API BFF プロキシ
 * クッキー admin_token を Authorization: Bearer に載せてバックエンドへ転送
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxy('GET', context.params);
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
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxy('DELETE', context.params);
}

async function proxy(
  method: string,
  params: Promise<{ path: string[] }>,
  request?: NextRequest
) {
  const { path } = await params;
  const pathStr = path.join('/');
  const url = `${API_BASE_URL}/${pathStr}`;

  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
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
