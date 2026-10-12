import { NextRequest, NextResponse } from 'next/server';
import { getStore, saveStore, getUserById, getEffectiveRole, createAuditLog } from '@/lib/server-store';
import { User, SystemRole } from '@/lib/types';

export async function GET(req: NextRequest) {
  const store = getStore();
  const searchParams = req.nextUrl.searchParams;
  const role = searchParams.get('role');
  const teamId = searchParams.get('teamId');
  const status = searchParams.get('status');

  let filtered = [...store.users];

  if (role) {
    filtered = filtered.filter((u) => u.systemRole === role);
  }
  if (teamId) {
    filtered = filtered.filter((u) => u.teamId === teamId);
  }
  if (status) {
    filtered = filtered.filter((u) => u.accountStatus === status);
  }

  return NextResponse.json(filtered);
}

export async function POST(req: NextRequest) {
  const actorId = req.headers.get('x-user-id') || 'user-admin';
  const actor = getUserById(actorId);

  if (!actor || getEffectiveRole(actor) !== 'Admin') {
    return NextResponse.json(
      { error: 'Forbidden: Only an authorized Admin can create or invite employees.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { name, email, role, systemRole = 'Employee', department, teamId, location, bio } = body;

    if (!name || !email || !department) {
      return NextResponse.json({ error: 'Name, email, and department are required' }, { status: 400 });
    }

    const store = getStore();
    const existing = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const id = `user-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString(36).substring(2, 6)}`;
    const initials = name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const employeeId = `CNT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser: User = {
      id,
      name,
      email,
      employeeId,
      role: role || 'Software Systems Engineer',
      systemRole: systemRole as SystemRole,
      accountStatus: 'Active',
      teamId,
      avatar: '',
      initials,
      department,
      location: location || 'Remote (UTC)',
      bio: bio || 'Continuity engineering team member.',
      activeProjectsCount: 0,
      pendingHandoffsCount: 0,
      isAdmin: systemRole === 'Admin',
      createdAt: new Date().toISOString(),
    };

    store.users.push(newUser);

    // If assigned to a team, add to team member list
    if (teamId) {
      const team = store.teams.find((t) => t.id === teamId);
      if (team && !team.memberIds.includes(id)) {
        team.memberIds.push(id);
      }
    }

    createAuditLog(
      actor.id,
      actor.name,
      'EMPLOYEE_INVITED',
      `Admin ${actor.name} invited new employee ${name} (${email}) as ${systemRole}.`,
      'Continuity Directory',
      { employeeId: id, email, systemRole }
    );

    saveStore(store);
    return NextResponse.json(newUser, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const actorId = req.headers.get('x-user-id') || 'user-admin';
  const actor = getUserById(actorId);

  if (!actor || getEffectiveRole(actor) !== 'Admin') {
    return NextResponse.json(
      { error: 'Forbidden: Only an authorized Admin can modify employee roles, status, or team assignments.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { userId, systemRole, accountStatus, teamId, role, department } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const store = getStore();
    const targetUser = store.users.find((u) => u.id === userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const changes: string[] = [];

    if (systemRole && systemRole !== targetUser.systemRole) {
      const oldRole = targetUser.systemRole;
      targetUser.systemRole = systemRole;
      targetUser.isAdmin = systemRole === 'Admin';
      changes.push(`role changed from ${oldRole} to ${systemRole}`);
      createAuditLog(
        actor.id,
        actor.name,
        'ROLE_CHANGED',
        `Admin ${actor.name} changed role of ${targetUser.name} from ${oldRole} to ${systemRole}.`,
        'Continuity RBAC',
        { userId, oldRole, newRole: systemRole }
      );
    }

    if (accountStatus && accountStatus !== targetUser.accountStatus) {
      targetUser.accountStatus = accountStatus;
      changes.push(`status set to ${accountStatus}`);
      createAuditLog(
        actor.id,
        actor.name,
        'EMPLOYEE_STATUS_CHANGED',
        `Admin ${actor.name} changed status of ${targetUser.name} to ${accountStatus}.`,
        'Continuity Directory',
        { userId, newStatus: accountStatus }
      );
    }

    if (teamId !== undefined && teamId !== targetUser.teamId) {
      const oldTeamId = targetUser.teamId;
      targetUser.teamId = teamId;

      // Remove from old team
      if (oldTeamId) {
        const oldTeam = store.teams.find((t) => t.id === oldTeamId);
        if (oldTeam) {
          oldTeam.memberIds = oldTeam.memberIds.filter((mid) => mid !== targetUser.id);
        }
      }
      // Add to new team
      if (teamId) {
        const newTeam = store.teams.find((t) => t.id === teamId);
        if (newTeam && !newTeam.memberIds.includes(targetUser.id)) {
          newTeam.memberIds.push(targetUser.id);
        }
      }

      changes.push(`transferred to team ${teamId || 'None'}`);
      createAuditLog(
        actor.id,
        actor.name,
        'MEMBER_TRANSFERRED',
        `Admin ${actor.name} transferred ${targetUser.name} from team ${oldTeamId || 'None'} to ${teamId || 'None'}.`,
        'Continuity Team Management',
        { userId, oldTeamId, newTeamId: teamId }
      );
    }

    if (role) targetUser.role = role;
    if (department) targetUser.department = department;

    saveStore(store);
    return NextResponse.json(targetUser);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}
