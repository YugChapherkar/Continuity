import { NextRequest, NextResponse } from 'next/server';
import { getStore, saveStore, getUserById, getEffectiveRole, createAuditLog } from '@/lib/server-store';
import { Team } from '@/lib/types';

export async function GET(req: NextRequest) {
  const actorId = req.headers.get('x-user-id') || 'user-admin';
  const actor = getUserById(actorId);
  const store = getStore();

  if (!actor) {
    return NextResponse.json(store.teams);
  }

  const role = getEffectiveRole(actor);

  if (role === 'Admin') {
    // Admin sees all teams with enriched leader information
    return NextResponse.json(store.teams);
  }

  // Team Leader sees teams they lead or belong to
  if (role === 'Team Leader') {
    const leaderTeams = store.teams.filter(
      (t) => t.leaderId === actor.id || t.memberIds.includes(actor.id)
    );
    return NextResponse.json(leaderTeams);
  }

  // Employee sees only the team they belong to
  const employeeTeams = store.teams.filter(
    (t) => t.memberIds.includes(actor.id) || t.id === actor.teamId
  );
  return NextResponse.json(employeeTeams);
}

export async function POST(req: NextRequest) {
  const actorId = req.headers.get('x-user-id') || 'user-admin';
  const actor = getUserById(actorId);

  if (!actor || getEffectiveRole(actor) !== 'Admin') {
    return NextResponse.json(
      { error: 'Forbidden: Only an authorized Admin can create new teams.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { name, description, department, leaderId, memberIds = [] } = body;

    if (!name || !department || !leaderId) {
      return NextResponse.json(
        { error: 'Team name, department, and leader are required.' },
        { status: 400 }
      );
    }

    const store = getStore();
    const leader = store.users.find((u) => u.id === leaderId);
    if (!leader) {
      return NextResponse.json({ error: 'Selected team leader does not exist.' }, { status: 400 });
    }

    if (leader.accountStatus !== 'Active') {
      return NextResponse.json({ error: 'Team leader must be an active user.' }, { status: 400 });
    }

    const id = `team-${name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30)}-${Date.now().toString(36).substring(2, 5)}`;

    // Ensure leader is a member
    const uniqueMembers = Array.from(new Set([leaderId, ...memberIds]));

    const newTeam: Team = {
      id,
      name,
      description: description || '',
      department,
      status: 'Active',
      leaderId,
      leaderName: leader.name,
      memberIds: uniqueMembers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update leader's systemRole to Team Leader if they were Employee
    if (leader.systemRole === 'Employee') {
      leader.systemRole = 'Team Leader';
    }
    leader.teamId = id;

    // Update members' teamId
    uniqueMembers.forEach((mId) => {
      const member = store.users.find((u) => u.id === mId);
      if (member) {
        member.teamId = id;
      }
    });

    store.teams.push(newTeam);

    createAuditLog(
      actor.id,
      actor.name,
      'TEAM_CREATED',
      `Admin ${actor.name} created team "${name}" in ${department} and appointed ${leader.name} as Team Leader.`,
      name,
      { teamId: id, leaderId, memberCount: uniqueMembers.length }
    );

    saveStore(store);
    return NextResponse.json(newTeam, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}
