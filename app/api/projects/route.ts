import { NextRequest, NextResponse } from 'next/server';
import { getStore, saveStore, getUserById, getEffectiveRole, createAuditLog } from '@/lib/server-store';
import { Project, ProjectLifecycleStatus } from '@/lib/types';

function computeProjectHealth(project: Project): { health: 'Green' | 'At Risk' | 'Critical'; reasons: string[] } {
  const reasons: string[] = [];
  const now = new Date();

  // 1. Check for requested revisions
  if (project.status === 'Changes Requested') {
    reasons.push('Admin requested revisions during final review round.');
  }

  // 2. Check for overdue tasks
  const tasks = project.tasks || [];
  const overdueTasks = tasks.filter(
    (t) => t.deadline && new Date(t.deadline) < now && t.status !== 'Completed'
  );
  if (overdueTasks.length > 0) {
    reasons.push(`${overdueTasks.length} task(s) past scheduled deadline.`);
  }

  // 3. Check for critical or blocked tasks
  const blockedTasks = tasks.filter((t) => t.status === 'Blocked');
  if (blockedTasks.length > 0) {
    reasons.push(`${blockedTasks.length} task(s) currently blocked.`);
  }

  // 4. Check deadline proximity
  if (project.deadline && project.status !== 'Delivered') {
    const deadlineDate = new Date(project.deadline);
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (daysUntilDeadline < 0) {
      reasons.push(`Project deadline exceeded by ${Math.abs(daysUntilDeadline)} days.`);
    } else if (daysUntilDeadline <= 14 && tasks.some((t) => t.status !== 'Completed')) {
      reasons.push(`Target deadline in ${daysUntilDeadline} days with remaining incomplete tasks.`);
    }
  }

  if (reasons.length >= 2 || (project.deadline && new Date(project.deadline) < now && project.status !== 'Delivered')) {
    return { health: 'Critical', reasons };
  }
  if (reasons.length >= 1) {
    return { health: 'At Risk', reasons };
  }
  return { health: 'Green', reasons: ['All execution milestones on schedule', 'No critical blockers recorded'] };
}

export async function GET(req: NextRequest) {
  const actorId = req.headers.get('x-user-id') || 'user-admin';
  const actor = getUserById(actorId);
  const store = getStore();

  const searchParams = req.nextUrl.searchParams;
  const statusFilter = searchParams.get('status');
  const teamFilter = searchParams.get('teamId');
  const priorityFilter = searchParams.get('priority');

  let list = store.projects.map((p) => {
    const healthInfo = computeProjectHealth(p);
    return {
      ...p,
      health: healthInfo.health,
      healthReasons: healthInfo.reasons,
    };
  });

  if (actor) {
    const role = getEffectiveRole(actor);

    if (role === 'Team Leader') {
      list = list.filter(
        (p) =>
          p.teamLeaderId === actor.id ||
          p.ownerId === actor.id ||
          p.teamId === actor.teamId ||
          p.teamMembers?.some((m) => m.userId === actor.id && m.role === 'Lead')
      );
    } else if (role === 'Employee') {
      list = list.filter(
        (p) =>
          p.teamId === actor.teamId ||
          p.teamMembers?.some((m) => m.userId === actor.id) ||
          p.tasks?.some((t) => t.assigneeId === actor.id || t.assignee === actor.name)
      );
    }
  }

  if (statusFilter) {
    list = list.filter((p) => p.status === statusFilter);
  }
  if (teamFilter) {
    list = list.filter((p) => p.teamId === teamFilter);
  }
  if (priorityFilter) {
    list = list.filter((p) => p.priority === priorityFilter);
  }

  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const actorId = req.headers.get('x-user-id') || 'user-admin';
  const actor = getUserById(actorId);

  if (!actor || getEffectiveRole(actor) !== 'Admin') {
    return NextResponse.json(
      { error: 'Forbidden: Only an authorized Admin can create new projects.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      name,
      description,
      client,
      scope,
      expectedDeliverables = [],
      startDate,
      deadline,
      priority = 'P1',
      budget,
      teamId,
      teamLeaderId,
      stakeholders = [],
      acceptanceCriteria,
    } = body;

    if (!name || !description || !client || !deadline || !teamId) {
      return NextResponse.json(
        { error: 'Project name, description, client, deadline, and assigned team are required.' },
        { status: 400 }
      );
    }

    const store = getStore();
    const assignedTeam = store.teams.find((t) => t.id === teamId);
    if (!assignedTeam) {
      return NextResponse.json({ error: 'Assigned team does not exist.' }, { status: 400 });
    }

    const leaderId = teamLeaderId || assignedTeam.leaderId;
    const leader = store.users.find((u) => u.id === leaderId);
    if (!leader) {
      return NextResponse.json({ error: 'Assigned team leader does not exist.' }, { status: 400 });
    }

    const id = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 40);

    const initialMembers = assignedTeam.memberIds.map((mId) => ({
      userId: mId,
      role: (mId === leaderId ? 'Lead' : 'Member') as 'Lead' | 'Member',
      responsibility: mId === leaderId ? 'Project technical lead & execution manager' : 'Assigned engineering contributor',
      joinedAt: new Date().toISOString().split('T')[0],
      isPrimaryOnCall: mId === leaderId,
    }));

    const newProject: Project = {
      id,
      name,
      description,
      client,
      scope: scope || description,
      expectedDeliverables: Array.isArray(expectedDeliverables) ? expectedDeliverables : [expectedDeliverables],
      startDate: startDate || new Date().toISOString().split('T')[0],
      deadline,
      priority: priority as 'P0' | 'P1' | 'P2',
      budget: budget || '$150,000',
      teamId: assignedTeam.id,
      teamLeaderId: leader.id,
      stakeholders: Array.isArray(stakeholders) ? stakeholders : [client, actor.name],
      acceptanceCriteria: acceptanceCriteria || 'All deliverables meet engineering standards and pass QA validation.',
      status: 'Active' as ProjectLifecycleStatus,
      health: 'Green',
      healthReasons: ['Project initialized successfully'],
      currentVersionId: 'v1.0.0',
      ownerId: leader.id,
      team: assignedTeam.name,
      teamDescription: assignedTeam.description,
      teamChannel: `#team-${assignedTeam.id}`,
      teamMembers: initialMembers,
      repositoryUrl: `github.com/internal-corp/${id}`,
      architectureSummary: `${name} engineering architecture specification and execution blueprint.`,
      quickstartGuide: `# Bootstrap ${name}\n./bin/setup-dev-environment.sh`,
      milestones: [
        {
          id: `m-${id}-1`,
          projectId: id,
          title: 'Milestone 1: Architecture Specification & Core Prototype',
          deadline: deadline,
          status: 'In Progress',
          order: 1,
        },
      ],
      decisions: [],
      versions: [
        {
          id: 'v1.0.0',
          hash: '1a2b3c4',
          timestamp: new Date().toISOString(),
          author: { name: actor.name, avatar: '' },
          commitMessage: 'Initial project architecture repository skeleton',
          changedFilesCount: 3,
          changedFiles: [{ path: 'README.md', insertions: 25, deletions: 0 }],
        },
      ],
      tasks: [
        {
          id: `TASK-${Math.floor(100 + Math.random() * 900)}`,
          projectId: id,
          projectName: name,
          title: `Initial architecture review and kickoff for ${name}`,
          description: `Kickoff meeting with ${assignedTeam.name} and deliverable sprint planning.`,
          status: 'To Do',
          priority: 'P1',
          assignee: leader.name,
          assigneeId: leader.id,
          creatorId: actor.id,
          creatorName: actor.name,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: deadline,
          deadline: deadline,
          estimatedEffortHours: 8,
          createdAt: new Date().toISOString(),
          history: [],
        },
      ],
      files: [],
      updatedAt: new Date().toISOString(),
    };

    store.projects.push(newProject);

    createAuditLog(
      actor.id,
      actor.name,
      'PROJECT_CREATED',
      `Admin ${actor.name} created project "${name}" for client "${client}", assigned to ${assignedTeam.name} (Lead: ${leader.name}).`,
      name,
      { projectId: id, client, teamId: assignedTeam.id, deadline }
    );

    saveStore(store);
    return NextResponse.json(newProject, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}
