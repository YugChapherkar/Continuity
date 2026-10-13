import { NextRequest, NextResponse } from 'next/server';
import { getStore, saveStore, getEffectiveRole, createAuditLog } from '@/lib/server-store';
import { requireUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;

  const { id } = await params;
  const store = getStore();

  const team = store.teams.find((t) => t.id === id);
  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }

  // Authorization check
  if (actor) {
    const role = getEffectiveRole(actor);
    if (role === 'Employee' && team.id !== actor.teamId && !team.memberIds.includes(actor.id)) {
      return NextResponse.json(
        { error: 'Forbidden: You are not authorized to view this team.' },
        { status: 403 }
      );
    }
  }

  // Enrich with members, projects, and workload statistics
  const members = store.users.filter((u) => team.memberIds.includes(u.id));
  const leader = store.users.find((u) => u.id === team.leaderId);
  const teamProjects = store.projects.filter(
    (p) => p.teamId === team.id || p.team === team.name
  );

  const teamTasks = teamProjects.flatMap((p) => p.tasks || []);
  const overdueTasks = teamTasks.filter(
    (t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'Completed'
  );
  const blockedTasks = teamTasks.filter((t) => t.status === 'Blocked');

  return NextResponse.json({
    ...team,
    leader,
    members,
    projects: teamProjects,
    stats: {
      totalMembers: members.length,
      activeProjectsCount: teamProjects.filter((p) => p.status !== 'Delivered').length,
      totalTasksCount: teamTasks.length,
      overdueTasksCount: overdueTasks.length,
      blockedTasksCount: blockedTasks.length,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;

  const { id } = await params;

  if (!actor || getEffectiveRole(actor) !== 'Admin') {
    return NextResponse.json(
      { error: 'Forbidden: Only an authorized Admin can modify team parameters or appoint leaders.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { name, description, department, status, leaderId, memberIds } = body;

    const store = getStore();
    const team = store.teams.find((t) => t.id === id);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (department) team.department = department;

    // Leader change
    if (leaderId && leaderId !== team.leaderId) {
      const newLeader = store.users.find((u) => u.id === leaderId);
      if (!newLeader) {
        return NextResponse.json({ error: 'New leader user not found.' }, { status: 400 });
      }
      if (newLeader.accountStatus !== 'Active') {
        return NextResponse.json({ error: 'New leader must be an active account.' }, { status: 400 });
      }

      const oldLeaderName = team.leaderName || team.leaderId;
      team.leaderId = leaderId;
      team.leaderName = newLeader.name;

      if (!team.memberIds.includes(leaderId)) {
        team.memberIds.push(leaderId);
      }
      newLeader.systemRole = 'Team Leader';
      newLeader.teamId = team.id;

      createAuditLog(
        actor.id,
        actor.name,
        'LEADER_ASSIGNED',
        `Admin ${actor.name} appointed ${newLeader.name} as Team Leader for team "${team.name}" (previously ${oldLeaderName}).`,
        team.name,
        { teamId: team.id, oldLeader: oldLeaderName, newLeaderId: leaderId }
      );
    }

    // Status change (e.g. deactivate team without deleting historical records)
    if (status && status !== team.status) {
      team.status = status;
      createAuditLog(
        actor.id,
        actor.name,
        status === 'Inactive' ? 'TEAM_DEACTIVATED' : 'TEAM_UPDATED',
        `Admin ${actor.name} changed status of team "${team.name}" to ${status}. Historical projects and tasks preserved.`,
        team.name,
        { teamId: team.id, status }
      );
    }

    // Member list updates
    if (memberIds && Array.isArray(memberIds)) {
      // Ensure leader remains in memberIds
      const updatedMembers = Array.from(new Set([team.leaderId, ...memberIds]));
      team.memberIds = updatedMembers;

      // Update users' teamId
      updatedMembers.forEach((mId) => {
        const u = store.users.find((user) => user.id === mId);
        if (u) u.teamId = team.id;
      });

      createAuditLog(
        actor.id,
        actor.name,
        'TEAM_UPDATED',
        `Admin ${actor.name} updated membership for team "${team.name}" (${updatedMembers.length} active members).`,
        team.name,
        { teamId: team.id, memberCount: updatedMembers.length }
      );
    }

    team.updatedAt = new Date().toISOString();
    saveStore(store);

    return NextResponse.json(team);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}
