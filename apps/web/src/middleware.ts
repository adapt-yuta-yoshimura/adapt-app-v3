import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/store', '/signup', '/reset-password'];
const AUTH_COOKIE = 'adapt_token';

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return true;
  }
  if (pathname.startsWith('/courses') || pathname.startsWith('/instructors')) {
    return true;
  }
  return false;
}

function isAuthenticatedRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/instructor') ||
    pathname.startsWith('/learner') ||
    pathname.startsWith('/settings')
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (isAuthenticatedRoute(pathname) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
