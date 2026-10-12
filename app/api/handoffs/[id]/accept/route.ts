import { NextRequest, NextResponse } from 'next/server';
import {
  getStore,
  saveStore,
  getUserById,
  getEffectiveRole,
  createAuditLog,
  createNotification,
  transferTaskOwnership,
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

  // Verify actor is the intended recipient, or an Admin/Team Leader executing an override
  const role = getEffectiveRole(actor);
  const isRecipient = actor.id === handoff.recipientId;
  const isManager = role === 'Admin' || role === 'Team Leader';

  if (!isRecipient && !isManager) {
    return NextResponse.json(
      { error: 'Forbidden: Only the designated recipient or an authorized manager can accept this handoff.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { signoffNote = 'Attested operational readiness and assumed primary custodianship.' } = body;

    handoff.status = 'Accepted';
    handoff.acceptedAt = new Date().toISOString();
    handoff.auditTrail.push({
      action: 'HANDOFF_ACCEPTED',
      actor: actor.name,
      timestamp: new Date().toISOString(),
      detail: `Handoff verified and accepted. Note: "${signoffNote}". Operational ownership transferred.`,
    });

    createAuditLog(
      actor.id,
      actor.name,
      'HANDOFF_ACCEPTED',
      `Handoff ${handoff.id} accepted by ${actor.name} for "${handoff.projectName}". Custodianship transferred.`,
      handoff.projectName,
      { handoffId: handoff.id, taskId: handoff.taskId, recipientId: handoff.recipientId }
    );

    // ATOMIC OWNERSHIP TRANSFER
    if (handoff.taskId) {
      transferTaskOwnership(
        handoff.taskId,
        handoff.recipientId,
        actor,
        signoffNote,
        isRecipient ? 'Recipient Acceptance' : 'Manager Override',
        handoff.id
      );
    }

    // Notify original sender
    createNotification(
      `Handover Accepted: ${handoff.id}`,
      `${actor.name} accepted the handover for "${handoff.projectName}"${handoff.taskTitle ? ` (${handoff.taskTitle})` : ''}. Custodianship transfer complete.`,
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
