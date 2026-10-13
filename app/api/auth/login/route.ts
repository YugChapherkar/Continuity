import { NextRequest, NextResponse } from 'next/server';
import { verifyUserCredentials, getUserById } from '@/lib/server-store';
import { signJwtToken, AUTH_COOKIE_NAME } from '@/lib/auth';

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

    const user = await verifyUserCredentials(identifier, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please verify your email/ID and password.' },
        { status: 401 }
      );
    }

    // Generate signed JWT token with user identity
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

    // Create response with user info and token
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

    // Set secure HTTP-only cookie
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
