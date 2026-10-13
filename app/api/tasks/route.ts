import { NextRequest, NextResponse } from 'next/server';
import {
  getStore,
  saveStore,
  getEffectiveRole,
  isUserAuthorizedForProject,
  createAuditLog,
  createNotification,
} from '@/lib/server-store';
import { requireUser } from '@/lib/auth';
import { Task, TaskStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;
  const store = getStore();

  const searchParams = req.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');
  const assigneeId = searchParams.get('assigneeId');
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');

  // Gather all tasks across all projects
  let allTasks: (Task & { projectId: string; projectName: string })[] = [];
  store.projects.forEach((p) => {
    (p.tasks || []).forEach((t) => {
      allTasks.push({
        ...t,
        projectId: p.id,
        projectName: p.name,
      });
    });
  });

  // Filter based on authorization
  if (actor) {
    const role = getEffectiveRole(actor);
    if (role === 'Team Leader') {
      const authorizedProjectIds = new Set(
        store.projects
          .filter((p) => isUserAuthorizedForProject(actor, p.id))
          .map((p) => p.id)
      );
      allTasks = allTasks.filter((t) => authorizedProjectIds.has(t.projectId));
    } else if (role === 'Employee') {
      allTasks = allTasks.filter(
        (t) => t.assigneeId === actor.id || t.assignee === actor.name
      );
    }
  }

  if (projectId) {
    allTasks = allTasks.filter((t) => t.projectId === projectId);
  }
  if (assigneeId) {
    allTasks = allTasks.filter((t) => t.assigneeId === assigneeId);
  }
  if (status) {
    allTasks = allTasks.filter((t) => t.status === status);
  }
  if (priority) {
    allTasks = allTasks.filter((t) => t.priority === priority);
  }

  return NextResponse.json(allTasks);
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;

  const role = getEffectiveRole(actor);
  if (role === 'Employee') {
    return NextResponse.json(
      { error: 'Forbidden: Only an authorized Admin or Team Leader can create and assign tasks.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      projectId,
      title,
      description,
      milestoneId,
      assigneeId,
      priority = 'P1',
      startDate,
      dueDate,
      estimatedEffortHours,
      dependencies = [],
      acceptanceCriteria,
    } = body;

    if (!projectId || !title || !assigneeId) {
      return NextResponse.json(
        { error: 'Project ID, task title, and assignee are required.' },
        { status: 400 }
      );
    }

    const store = getStore();
    const project = store.projects.find((p) => p.id === projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    if (!isUserAuthorizedForProject(actor, projectId)) {
      return NextResponse.json(
        { error: 'Forbidden: You are not authorized to assign tasks in this project.' },
        { status: 403 }
      );
    }

    const assignee = store.users.find((u) => u.id === assigneeId);
    if (!assignee) {
      return NextResponse.json({ error: 'Assignee not found.' }, { status: 400 });
    }

    const taskId = `TASK-${Math.floor(100 + Math.random() * 900)}`;
    const milestone = project.milestones?.find((m) => m.id === milestoneId);

    const newTask: Task = {
      id: taskId,
      projectId: project.id,
      projectName: project.name,
      milestoneId,
      milestoneTitle: milestone?.title,
      title,
      description: description || '',
      status: 'To Do',
      priority: priority as 'P0' | 'P1' | 'P2',
      assignee: assignee.name,
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      creatorId: actor.id,
      creatorName: actor.name,
      startDate: startDate || new Date().toISOString().split('T')[0],
      dueDate,
      deadline: dueDate,
      estimatedEffortHours: estimatedEffortHours ? Number(estimatedEffortHours) : undefined,
      dependencies: Array.isArray(dependencies) ? dependencies : [],
      acceptanceCriteria: acceptanceCriteria || 'Deliverable meets project standards.',
      latestUpdate: 'Task created and assigned.',
      history: [
        {
          timestamp: new Date().toISOString(),
          actorId: actor.id,
          actorName: actor.name,
          fromStatus: 'None',
          toStatus: 'To Do',
          note: `Created and assigned to ${assignee.name} by ${actor.name}`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!project.tasks) {
      project.tasks = [];
    }
    project.tasks.unshift(newTask);

    // Notify employee of task assignment
    createNotification(
      'New Task Assigned',
      `${actor.name} assigned you "${title}" in ${project.name} (Priority: ${priority}).`,
      'task',
      assignee.id,
      `/projects/${project.id}`
    );

    createAuditLog(
      actor.id,
      actor.name,
      'TASK_CREATED',
      `${actor.name} created task "${title}" (${taskId}) and assigned to ${assignee.name} in ${project.name}.`,
      project.name,
      { taskId, projectId, assigneeId, priority }
    );

    saveStore(store);
    return NextResponse.json(newTask, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}
