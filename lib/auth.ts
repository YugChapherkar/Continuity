import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'continuity-enterprise-secret-key-2026-secure-hmac-sha256';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

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

export const AUTH_COOKIE_NAME = 'continuity_token';

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
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyJwtToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
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
