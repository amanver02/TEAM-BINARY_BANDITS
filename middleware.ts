import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware: protect all dashboard routes.
 * Checks for a Firebase session cookie (set by /api/auth/session).
 * Unauthenticated requests are redirected to /login.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — always allow
  const publicPaths = ['/login', '/api/auth'];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const session = request.cookies.get('csr360_session')?.value;
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
