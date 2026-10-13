import { NextRequest, NextResponse } from 'next/server';
import {
  getStore,
  saveStore,
  getEffectiveRole,
  createAuditLog,
  createNotification,
} from '@/lib/server-store';
import { requireUser } from '@/lib/auth';
import { EmployeeDailyUpdate } from '@/lib/types';

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;
  const store = getStore();

  const searchParams = req.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');
  const employeeId = searchParams.get('employeeId');

  let list = [...store.updates];

  if (actor) {
    const role = getEffectiveRole(actor);
    if (role === 'Employee') {
      list = list.filter((u) => u.employeeId === actor.id);
    } else if (role === 'Team Leader') {
      // Leader sees updates from their team members
      const team = store.teams.find((t) => t.leaderId === actor.id || t.id === actor.teamId);
      if (team) {
        list = list.filter((u) => team.memberIds.includes(u.employeeId) || u.employeeId === actor.id);
      }
    }
  }

  if (projectId) {
    list = list.filter((u) => u.projectId === projectId);
  }
  if (employeeId) {
    list = list.filter((u) => u.employeeId === employeeId);
  }

  // Sort newest first
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;

  try {
    const body = await req.json();
    const {
      projectId,
      taskId,
      completedWork,
      inProgress,
      nextSteps,
      blockers,
      dependencies,
      evidenceUrls = [],
    } = body;

    if (!projectId || !completedWork || !inProgress || !nextSteps) {
      return NextResponse.json(
        { error: 'Project ID, completed work, work in progress, and next steps are required.' },
        { status: 400 }
      );
    }

    const store = getStore();
    const project = store.projects.find((p) => p.id === projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    let taskTitle = undefined;
    if (taskId) {
      const task = project.tasks?.find((t) => t.id === taskId);
      if (task) {
        taskTitle = task.title;
        task.latestUpdate = `${completedWork} | Next: ${nextSteps}`;
        if (blockers) {
          task.status = 'Blocked';
        }
      }
    }

    const id = `upd-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;

    const newUpdate: EmployeeDailyUpdate = {
      id,
      employeeId: actor.id,
      employeeName: actor.name,
      employeeRole: actor.role,
      taskId,
      taskTitle,
      projectId: project.id,
      projectName: project.name,
      completedWork,
      inProgress,
      nextSteps,
      blockers: blockers || '',
      dependencies: dependencies || '',
      evidenceUrls: Array.isArray(evidenceUrls) ? evidenceUrls : [],
      status: 'Submitted',
      createdAt: new Date().toISOString(),
    };

    store.updates.unshift(newUpdate);

    // Notify Team Leader
    if (project.teamLeaderId && project.teamLeaderId !== actor.id) {
      createNotification(
        'New Progress Update Submitted',
        `${actor.name} submitted an update on ${taskTitle ? `"${taskTitle}"` : project.name}.`,
        'task',
        project.teamLeaderId,
        `/updates`
      );
    }

    createAuditLog(
      actor.id,
      actor.name,
      'UPDATE_SUBMITTED',
      `${actor.name} submitted progress update on ${project.name}${taskTitle ? ` (Task: ${taskTitle})` : ''}.`,
      project.name,
      { updateId: id, projectId: project.id, taskId }
    );

    saveStore(store);
    return NextResponse.json(newUpdate, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;

  const role = getEffectiveRole(actor);
  if (role === 'Employee') {
    return NextResponse.json(
      { error: 'Forbidden: Only a Team Leader or Admin can review employee updates.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { updateId, status, leaderComment } = body;

    if (!updateId) {
      return NextResponse.json({ error: 'Update ID is required' }, { status: 400 });
    }

    const store = getStore();
    const update = store.updates.find((u) => u.id === updateId);
    if (!update) {
      return NextResponse.json({ error: 'Update record not found' }, { status: 404 });
    }

    if (status) {
      update.status = status;
    }
    if (leaderComment !== undefined) {
      update.leaderComment = leaderComment;
    }
    update.leaderId = actor.id;
    update.reviewedAt = new Date().toISOString();

    // Notify employee of review feedback
    createNotification(
      'Progress Update Reviewed',
      `${actor.name} reviewed your update: ${leaderComment || status}`,
      'task',
      update.employeeId,
      `/updates`
    );

    createAuditLog(
      actor.id,
      actor.name,
      'UPDATE_REVIEWED',
      `${actor.name} reviewed update by ${update.employeeName} on ${update.projectName} (${status}).`,
      update.projectName,
      { updateId: update.id, status }
    );

    saveStore(store);
    return NextResponse.json(update);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}
