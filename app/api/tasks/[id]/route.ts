import { NextRequest, NextResponse } from 'next/server';
import {
  getStore,
  saveStore,
  getUserById,
  getEffectiveRole,
  createAuditLog,
  createNotification,
} from '@/lib/server-store';
import { Task, TaskStatus } from '@/lib/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const actorId = req.headers.get('x-user-id') || 'user-admin';
  const actor = getUserById(actorId);

  if (!actor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = getEffectiveRole(actor);
  const store = getStore();

  // Find task across projects
  let targetProject = null;
  let targetTask: Task | null = null;

  for (const project of store.projects) {
    const found = (project.tasks || []).find((t) => t.id === id);
    if (found) {
      targetProject = project;
      targetTask = found;
      break;
    }
  }

  if (!targetProject || !targetTask) {
    return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
  }

  // Authorization check
  const isAssignee =
    targetTask.assigneeId === actor.id ||
    targetTask.assignee.toLowerCase() === actor.name.toLowerCase();
  const isLeader =
    targetProject.teamLeaderId === actor.id ||
    (actor.teamId && targetProject.teamId === actor.teamId && role === 'Team Leader');
  const isAdmin = role === 'Admin';

  if (!isAssignee && !isLeader && !isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden: You do not have permission to modify this task.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      status,
      latestUpdate,
      evidenceUrls,
      assigneeId,
      priority,
      dueDate,
      note,
    } = body;

    const oldStatus = targetTask.status;

    // Status transition handling
    if (status && status !== oldStatus) {
      // Validate allowed transitions
      targetTask.status = status as TaskStatus;

      if (!targetTask.history) {
        targetTask.history = [];
      }

      targetTask.history.unshift({
        timestamp: new Date().toISOString(),
        actorId: actor.id,
        actorName: actor.name,
        fromStatus: oldStatus,
        toStatus: status,
        note: note || latestUpdate || `Status updated to ${status} by ${actor.name}`,
      });

      createAuditLog(
        actor.id,
        actor.name,
        'TASK_STATUS_CHANGED',
        `${actor.name} changed status of task "${targetTask.title}" (${targetTask.id}) from ${oldStatus} to ${status} in ${targetProject.name}.`,
        targetProject.name,
        { taskId: targetTask.id, fromStatus: oldStatus, toStatus: status }
      );

      // Notification logic
      if (status === 'Blocked' && targetProject.teamLeaderId) {
        createNotification(
          'Task Blocked Alert',
          `${actor.name} marked task "${targetTask.title}" as Blocked: ${latestUpdate || 'Help required'}`,
          'task',
          targetProject.teamLeaderId,
          `/projects/${targetProject.id}`
        );
      } else if (status === 'In Review' && targetProject.teamLeaderId) {
        createNotification(
          'Task Ready for Review',
          `${actor.name} submitted task "${targetTask.title}" for review.`,
          'task',
          targetProject.teamLeaderId,
          `/projects/${targetProject.id}`
        );
      }
    }

    if (latestUpdate) {
      targetTask.latestUpdate = latestUpdate;
    }

    if (evidenceUrls && Array.isArray(evidenceUrls)) {
      targetTask.evidenceUrls = evidenceUrls;
    }

    // Reassignment and priority changes: only Leader or Admin
    if ((isLeader || isAdmin) && assigneeId && assigneeId !== targetTask.assigneeId) {
      const newAssignee = store.users.find((u) => u.id === assigneeId);
      if (newAssignee) {
        const oldAssigneeName = targetTask.assignee;
        targetTask.assigneeId = newAssignee.id;
        targetTask.assignee = newAssignee.name;
        targetTask.assigneeName = newAssignee.name;

        createNotification(
          'Task Reassigned to You',
          `${actor.name} reassigned "${targetTask.title}" to you in ${targetProject.name}.`,
          'task',
          newAssignee.id,
          `/projects/${targetProject.id}`
        );

        createAuditLog(
          actor.id,
          actor.name,
          'TASK_ASSIGNED',
          `${actor.name} reassigned task "${targetTask.title}" from ${oldAssigneeName} to ${newAssignee.name}.`,
          targetProject.name,
          { taskId: targetTask.id, newAssigneeId: newAssignee.id }
        );
      }
    }

    if ((isLeader || isAdmin) && priority) {
      targetTask.priority = priority;
    }

    if ((isLeader || isAdmin) && dueDate) {
      targetTask.dueDate = dueDate;
      targetTask.deadline = dueDate;
    }

    targetTask.updatedAt = new Date().toISOString();
    targetProject.updatedAt = new Date().toISOString();

    saveStore(store);
    return NextResponse.json(targetTask);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}
