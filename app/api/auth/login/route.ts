import { NextRequest, NextResponse } from 'next/server';
import { verifyUserCredentials } from '@/lib/server-store';
import { signJwtToken, AUTH_COOKIE_NAME } from '@/lib/auth';

interface RateLimitEntry {
  attempts: number[];
  lockedUntil?: number;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const loginAttempts = new Map<string, RateLimitEntry>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = body.email || body.identifier || body.employeeId;
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/Employee ID and password are required' },
        { status: 400 }
      );
    }

    const ip = getClientIp(req);
    const cleanId = String(identifier).trim().toLowerCase();
    const rateLimitKey = `${ip}:${cleanId}`;
    const now = Date.now();

    // 1. Rate limiting & Lockout check
    const entry = loginAttempts.get(rateLimitKey);
    if (entry) {
      if (entry.lockedUntil && now < entry.lockedUntil) {
        const remainingMin = Math.ceil((entry.lockedUntil - now) / 60000);
        return NextResponse.json(
          {
            error: `Too many failed login attempts. Account temporarily locked out. Please try again in ${remainingMin} minute(s).`,
          },
          { status: 429 }
        );
      }

      // Filter out attempts outside the sliding window
      entry.attempts = entry.attempts.filter((t) => now - t < WINDOW_MS);
      if (entry.attempts.length >= MAX_ATTEMPTS) {
        entry.lockedUntil = now + LOCKOUT_MS;
        loginAttempts.set(rateLimitKey, entry);
        return NextResponse.json(
          {
            error: 'Too many failed login attempts. Account temporarily locked out for 15 minutes.',
          },
          { status: 429 }
        );
      }
    }

    // 2. Verify credentials
    const user = await verifyUserCredentials(identifier, password);
    if (!user) {
      // Record failed attempt
      const current = loginAttempts.get(rateLimitKey) || { attempts: [] };
      current.attempts = current.attempts.filter((t) => now - t < WINDOW_MS);
      current.attempts.push(now);
      if (current.attempts.length >= MAX_ATTEMPTS) {
        current.lockedUntil = now + LOCKOUT_MS;
      }
      loginAttempts.set(rateLimitKey, current);

      return NextResponse.json(
        { error: 'Invalid credentials. Please verify your email/ID and password.' },
        { status: 401 }
      );
    }

    // Reset rate limiter on successful authentication
    loginAttempts.delete(rateLimitKey);

    // 3. Generate signed JWT token
    const token = await signJwtToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      systemRole: user.systemRole || (user.isAdmin ? 'Admin' : 'Employee'),
      employeeId: user.employeeId || '',
      department: user.department,
      teamId: user.teamId,
    });

    // 4. Return sanitized user and token
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role,
        systemRole: user.systemRole || (user.isAdmin ? 'Admin' : 'Employee'),
        department: user.department,
        teamId: user.teamId,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
        initials: user.initials,
      },
    });

    // 5. Set secure HTTP-only cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}

