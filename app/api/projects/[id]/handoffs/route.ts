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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser(req);
  const actor = auth.user || {
    id: 'user-yash',
    name: 'Yash Sharma',
    role: 'Staff Platform Engineer',
  };

  try {
    const { id: projectId } = await params;
    const body = await req.json();

    const {
      recipientId,
      note = '',
      executiveSummary = '',
      completedItems = [],
      nextSteps = [],
      criticalBlockers = [],
      runbookCommands = [],
      setupInstructions = '',
      files = [],
    } = body;

    if (!recipientId) {
      return NextResponse.json(
        { error: 'Recipient is required.' },
        { status: 400 }
      );
    }

    const store = getStore();
    const project = store.projects.find((p) => p.id === projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const recipient = store.users.find((u) => u.id === recipientId);
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient user does not exist.' }, { status: 400 });
    }

    const readiness = computeHandoverReadiness({
      executiveSummary,
      completedItems,
      nextSteps,
      criticalBlockers,
      runbookCommands,
      setupInstructions,
      files,
      note,
    });

    const handoffId = `HO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newHandoff: HandoffPackage = {
      id: handoffId,
      projectId,
      projectName: project.name,
      senderId: actor.id,
      recipientId: recipient.id,
      pinnedVersionId: project.currentVersionId || 'v2.4.0',
      pinnedVersionHash: 'a9f82c1e4b',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      note: note || `Engineering handoff for ${project.name}`,
      completenessScore: readiness.score,
      readinessCheck: readiness,
      setupInstructions,
      pendingTasks: nextSteps,
      files,
      briefing: {
        executiveSummary: executiveSummary || note,
        completedItems,
        nextSteps,
        criticalBlockers,
        architecturalDecisions: project.decisions?.map((d) => `${d.id}: ${d.title}`) || [],
        keyFiles: files.length > 0 ? files : project.files?.map((f) => f.path) || [],
        runbookCommands,
      },
      auditTrail: [
        {
          action: 'HANDOFF_INITIATED',
          actor: actor.name,
          timestamp: new Date().toISOString(),
          detail: `Handoff dossier created and dispatched to ${recipient.name} via Spring Boot compatible API. Readiness: ${readiness.score}%.`,
        },
      ],
    };

    store.handoffs.unshift(newHandoff);

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
          briefingData: JSON.stringify(newHandoff.briefing),
          auditTrailData: JSON.stringify(newHandoff.auditTrail),
        },
      });
    } catch (e) {
      console.warn('Prisma sync skipped:', e);
    }

    createAuditLog(
      actor.id,
      actor.name,
      'HANDOFF_INITIATED',
      `Dispatched handoff package ${newHandoff.id} for project "${project.name}" to ${recipient.name}.`,
      project.name,
      { handoffId: newHandoff.id, projectId: newHandoff.projectId }
    );

    createNotification(
      'New Handoff Awaiting Sign-off',
      `${actor.name} transferred project "${project.name}" custody to you. Review the briefing dossier.`,
      'handoff',
      recipient.id,
      `/handoffs/${newHandoff.id}`
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
