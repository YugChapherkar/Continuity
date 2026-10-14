import { NextRequest, NextResponse } from 'next/server';
import {
  getStore,
  saveStore,
  createAuditLog,
  createNotification,
  computeHandoverReadiness,
} from '@/lib/server-store';
import { requireUser } from '@/lib/auth';
import { HandoffPackage } from '@/lib/types';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;

  const store = getStore();
  const searchParams = req.nextUrl.searchParams;
  const recipientId = searchParams.get('recipientId');
  const senderId = searchParams.get('senderId');
  const taskId = searchParams.get('taskId');
  const projectId = searchParams.get('projectId');
  const status = searchParams.get('status');

  let list = [...store.handoffs];

  if (recipientId) {
    list = list.filter((h) => h.recipientId === recipientId);
  }
  if (senderId) {
    list = list.filter((h) => h.senderId === senderId);
  }
  if (taskId) {
    list = list.filter((h) => h.taskId === taskId);
  }
  if (projectId) {
    list = list.filter((h) => h.projectId === projectId);
  }
  if (status) {
    list = list.filter((h) => h.status === status);
  }

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
      projectName,
      taskId,
      taskTitle,
      recipientId,
      pinnedVersionId = 'v2.4.0',
      pinnedVersionHash = 'a9f82c1',
      note = '',
      executiveSummary = '',
      completedItems = [],
      nextSteps = [],
      criticalBlockers = [],
      runbookCommands = [],
      setupInstructions = '',
      pendingTasks = [],
      files = [],
    } = body;

    if (!projectId || !recipientId) {
      return NextResponse.json(
        { error: 'Project ID and recipient are required.' },
        { status: 400 }
      );
    }

    const store = getStore();
    const project = store.projects.find((p) => p.id === projectId);
    const targetProjectName = projectName || project?.name || 'Continuity Project';

    const recipient = store.users.find((u) => u.id === recipientId);
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient user does not exist.' }, { status: 400 });
    }

    // Resolve task if specified
    let targetTask = null;
    if (taskId && project) {
      targetTask = (project.tasks || []).find((t) => t.id === taskId);
    }

    // Run Smart Handover Readiness Checker
    const readiness = computeHandoverReadiness({
      executiveSummary,
      completedItems,
      nextSteps: nextSteps.length > 0 ? nextSteps : pendingTasks,
      criticalBlockers,
      runbookCommands,
      setupInstructions,
      files,
      note,
    });

    const id = `HO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newHandoff: HandoffPackage = {
      id,
      projectId,
      projectName: targetProjectName,
      taskId: taskId || undefined,
      taskTitle: taskTitle || targetTask?.title || undefined,
      senderId: actor.id,
      recipientId: recipient.id,
      pinnedVersionId,
      pinnedVersionHash,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      note,
      completenessScore: readiness.score,
      readinessCheck: readiness,
      setupInstructions,
      pendingTasks: pendingTasks.length > 0 ? pendingTasks : nextSteps,
      files,
      briefing: {
        executiveSummary,
        completedItems,
        nextSteps: nextSteps.length > 0 ? nextSteps : pendingTasks,
        criticalBlockers,
        architecturalDecisions: project?.decisions?.map((d) => `${d.id}: ${d.title}`) || [],
        keyFiles: files.length > 0 ? files : project?.files?.map((f) => f.path) || [],
        runbookCommands,
      },
      auditTrail: [
        {
          action: 'HANDOFF_INITIATED',
          actor: actor.name,
          timestamp: new Date().toISOString(),
          detail: `Handoff dossier created and dispatched to ${recipient.name}. Readiness Score: ${readiness.score}%. Ownership remains with ${actor.name} until acceptance.`,
        },
      ],
    };

    // Prepend to store
    store.handoffs.unshift(newHandoff);

    // Sync to Prisma SQLite DB
    try {
      await prisma.handoff.create({
        data: {
          id: newHandoff.id,
          projectId: newHandoff.projectId,
          projectName: newHandoff.projectName,
          senderId: newHandoff.senderId,
          recipientId: newHandoff.recipientId,
          status: newHandoff.status,
          completenessScore: newHandoff.completenessScore,
          note: newHandoff.note || null,
          taskTitle: newHandoff.taskTitle || null,
          briefingData: JSON.stringify(newHandoff.briefing),
          auditTrailData: JSON.stringify(newHandoff.auditTrail),
        },
      });
    } catch (dbErr) {
      console.warn('Prisma handoff sync warning:', dbErr);
    }

    // Cryptographic audit log
    createAuditLog(
      actor.id,
      actor.name,
      'HANDOFF_INITIATED',
      `Handoff dossier ${id} initiated for "${targetProjectName}"${targetTask ? ` (Task: ${targetTask.title})` : ''} to ${recipient.name}. Readiness: ${readiness.score}%.`,
      targetProjectName,
      {
        handoffId: id,
        taskId: newHandoff.taskId,
        senderId: actor.id,
        recipientId: recipient.id,
        score: readiness.score,
      }
    );

    // Notify recipient
    createNotification(
      `Incoming Handover Package: ${id}`,
      `${actor.name} dispatched a handover dossier for "${targetProjectName}"${targetTask ? ` (${targetTask.title})` : ''}. Review and acceptance required.`,
      'handoff',
      recipient.id,
      `/handoffs/${id}`
    );

    saveStore(store);
    return NextResponse.json(newHandoff, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
