import { NextRequest, NextResponse } from 'next/server';
import {
  getStore,
  saveStore,
  getUserById,
  createAuditLog,
  createNotification,
} from '@/lib/server-store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const actorId = req.headers.get('x-user-id') || 'user-jessica';
  const actor = getUserById(actorId);

  if (!actor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = getStore();
  const handoff = store.handoffs.find((h) => h.id === id);

  if (!handoff) {
    return NextResponse.json({ error: 'Handoff package not found' }, { status: 404 });
  }

  if (actor.id !== handoff.recipientId) {
    return NextResponse.json(
      { error: 'Forbidden: Only the designated recipient can request clarification on this handoff.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { question = 'Additional operational context or runbook verification needed before accepting.' } = body;

    handoff.status = 'Clarification Requested';
    handoff.clarificationRequest = question;

    handoff.auditTrail.push({
      action: 'HANDOFF_CLARIFICATION_REQUESTED',
      actor: actor.name,
      timestamp: new Date().toISOString(),
      detail: `Recipient requested clarification: "${question}". Custodianship transfer paused pending response.`,
    });

    createAuditLog(
      actor.id,
      actor.name,
      'HANDOFF_CLARIFICATION_REQUESTED',
      `Clarification requested on handoff ${handoff.id} by ${actor.name}: "${question}".`,
      handoff.projectName,
      { handoffId: handoff.id, taskId: handoff.taskId, question }
    );

    // Notify sender that clarification is needed
    createNotification(
      `Clarification Requested: ${handoff.id}`,
      `${actor.name} requested clarification on "${handoff.projectName}": "${question}". Please provide details before handoff can proceed.`,
      'handoff',
      handoff.senderId,
      `/handoffs/${handoff.id}`
    );

    saveStore(store);
    return NextResponse.json({ success: true, handoff });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
