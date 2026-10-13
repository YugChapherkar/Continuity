import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from './server-store';
import { User } from './types';

export const AUTH_COOKIE_NAME = 'continuity_token';

/**
 * Resolve and validate the JWT secret key from environment.
 * Fails fast at startup if missing or shorter than 32 characters.
 */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error('FATAL: JWT_SECRET environment variable is missing or shorter than 32 characters.');
  }
  return new TextEncoder().encode(secret.trim());
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  systemRole: 'Admin' | 'Team Leader' | 'Employee';
  employeeId: string;
  department?: string;
  teamId?: string;
}

/**
 * Hash a plain password using bcrypt (10 rounds)
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compare plain password against bcrypt hash
 */
export async function verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Generate a signed JWT token valid for 7 days
 */
export async function signJwtToken(user: AuthUser): Promise<string> {
  const secretKey = getJwtSecret();
  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    systemRole: user.systemRole,
    employeeId: user.employeeId,
    department: user.department || '',
    teamId: user.teamId || '',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyJwtToken(token: string): Promise<AuthUser | null> {
  try {
    const secretKey = getJwtSecret();
    const { payload } = await jwtVerify(token, secretKey);
    if (!payload.sub || !payload.email) {
      return null;
    }
    return {
      id: payload.sub as string,
      email: payload.email as string,
      name: (payload.name as string) || '',
      role: (payload.role as string) || 'Systems Engineer',
      systemRole: (payload.systemRole as 'Admin' | 'Team Leader' | 'Employee') || 'Employee',
      employeeId: (payload.employeeId as string) || '',
      department: (payload.department as string) || undefined,
      teamId: (payload.teamId as string) || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Extract authenticated user from an incoming NextRequest.
 * Checks Authorization header (Bearer token) first, then continuity_token cookie.
 * Does NOT trust raw unverified X-User-Id header.
 */
export async function getAuthenticatedUser(req?: NextRequest): Promise<AuthUser | null> {
  let token: string | null = null;

  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else {
      const cookieHeader = req.cookies.get(AUTH_COOKIE_NAME);
      if (cookieHeader) {
        token = cookieHeader.value;
      }
    }
  } else {
    try {
      const cookieStore = await cookies();
      const cookie = cookieStore.get(AUTH_COOKIE_NAME);
      if (cookie) {
        token = cookie.value;
      }
    } catch {
      // not in request context
    }
  }

  if (!token) {
    return null;
  }

  return verifyJwtToken(token);
}

/**
 * Mandatory security gate for route handlers in app/api/**.
 * Reads ONLY the verified `x-authenticated-user-id` header (injected by middleware)
 * or verifies the JWT directly from headers/cookies.
 * Returns 401 if absent or unauthenticated. No default users anywhere.
 */
export async function requireUser(req: NextRequest): Promise<
  | { user: User; error?: never }
  | { user?: never; error: NextResponse }
> {
  // Read ONLY x-authenticated-user-id (injected by verified middleware)
  let userId = req.headers.get('x-authenticated-user-id');
  if (!userId) {
    const authUser = await getAuthenticatedUser(req);
    if (authUser) {
      userId = authUser.id;
    }
  }

  if (!userId) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized: Authentication required with valid JWT credentials.' },
        { status: 401 }
      ),
    };
  }

  const user = getUserById(userId);
  if (!user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized: Authenticated user not found in directory.' },
        { status: 401 }
      ),
    };
  }

  return { user };
}
