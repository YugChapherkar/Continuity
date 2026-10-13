import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_STRING = process.env.JWT_SECRET;
if (!JWT_SECRET_STRING || JWT_SECRET_STRING.trim().length < 32) {
  throw new Error('FATAL: JWT_SECRET environment variable is missing or shorter than 32 characters.');
}
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING.trim());
const AUTH_COOKIE_NAME = 'continuity_token';

// Public endpoints that do not require authentication
const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/health',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Resolve JWT token from Authorization header or HTTP-only cookie
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

  // 2. Verify token if present
  let verifiedPayload: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      verifiedPayload = payload;
    } catch {
      verifiedPayload = null;
    }
  }

  // 3. MANDATORY: Check all /api/* routes FIRST before any static or file exemptions
  if (pathname.startsWith('/api/')) {
    // Allow designated public API routes
    if (PUBLIC_API_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
      return NextResponse.next();
    }

    // All other API routes require valid JWT authentication
    if (!verifiedPayload) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required with valid JWT credentials.' },
        { status: 401 }
      );
    }

    // Strip client-spoofed headers and inject verified identity
    const requestHeaders = new Headers(req.headers);
    requestHeaders.delete('x-user-id');
    requestHeaders.set('x-authenticated-user-id', verifiedPayload.sub as string);
    requestHeaders.set('x-authenticated-user-role', (verifiedPayload.systemRole as string) || 'Employee');
    requestHeaders.set('x-authenticated-user-email', verifiedPayload.email as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 4. Static asset exemption restricted strictly to /_next, /images, /fonts, and favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 5. Public pages (landing and login)
  if (pathname === '/' || pathname === '/login') {
    // If user is already authenticated and visits /login, redirect to /dashboard
    if (pathname === '/login' && verifiedPayload) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // 6. Protected Web Pages (/dashboard, /tasks, /projects, etc.)
  if (!verifiedPayload) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
