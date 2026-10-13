import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const user = auth.user;

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
