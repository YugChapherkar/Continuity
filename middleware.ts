import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'continuity-enterprise-secret-key-2026-secure-hmac-sha256';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const AUTH_COOKIE_NAME = 'continuity_token';

// Public endpoints that do not require authentication
const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/health',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow public API routes
  if (PUBLIC_API_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  // 2. Allow static files, landing page, and login page
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname.includes('.')
  ) {
    // If user is already authenticated and visits /login, redirect to /dashboard
    if (pathname === '/login') {
      const cookie = req.cookies.get(AUTH_COOKIE_NAME);
      if (cookie?.value) {
        try {
          await jwtVerify(cookie.value, JWT_SECRET);
          return NextResponse.redirect(new URL('/dashboard', req.url));
        } catch {
          // Token invalid, proceed to login page
        }
      }
    }
    return NextResponse.next();
  }

  // 3. Resolve JWT token from Authorization header or HTTP-only cookie
  let token: string | null = null;
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    const cookie = req.cookies.get(AUTH_COOKIE_NAME);
    if (cookie) {
      token = cookie.value;
    }
  }

  // 4. Verify token
  let verifiedPayload: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      verifiedPayload = payload;
    } catch {
      verifiedPayload = null;
    }
  }

  // 5. Handle protected API routes
  if (pathname.startsWith('/api/')) {
    if (!verifiedPayload) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required with valid JWT credentials.' },
        { status: 401 }
      );
    }

    // Strip any untrusted X-User-Id header and inject verified user identity
    const requestHeaders = new Headers(req.headers);
    requestHeaders.delete('x-user-id'); // Never trust client-spoofed user id
    requestHeaders.set('x-authenticated-user-id', verifiedPayload.sub as string);
    requestHeaders.set('x-authenticated-user-role', (verifiedPayload.systemRole as string) || 'Employee');
    requestHeaders.set('x-authenticated-user-email', verifiedPayload.email as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 6. Handle protected Web Pages (/dashboard, /tasks, /projects, /admin, etc.)
  if (!verifiedPayload) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
