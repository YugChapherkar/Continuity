import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/server-store';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authUser = await getAuthenticatedUser(req);

  if (!authUser) {
    return NextResponse.json(
      { error: 'Unauthorized: No valid session or token provided' },
      { status: 401 }
    );
  }

  const user = getUserById(authUser.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
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
    bio: user.bio,
    location: user.location,
    activeProjectsCount: user.activeProjectsCount,
    pendingHandoffsCount: user.pendingHandoffsCount,
  });
}
