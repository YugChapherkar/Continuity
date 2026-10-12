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
  const actorId = req.headers.get('x-user-id') || 'user-admin';
  const actor = getUserById(actorId);

  if (!actor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = getEffectiveRole(actor);
  if (role !== 'Admin' && role !== 'Team Leader') {
    return NextResponse.json(
      { error: 'Forbidden: Only an authorized Admin or Team Leader can execute a manager override transfer.' },
      { status: 403 }
    );
  }

  const store = getStore();
  const handoff = store.handoffs.find((h) => h.id === id);

  if (!handoff) {
    return NextResponse.json({ error: 'Handoff package not found' }, { status: 404 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { overrideReason = 'Authorized manager operational override transfer to ensure shift continuity.' } = body;

    const recipient = store.users.find((u) => u.id === handoff.recipientId);
    if (!recipient) {
      return NextResponse.json({ error: 'Target recipient does not exist.' }, { status: 400 });
    }

    handoff.status = 'Accepted';
    handoff.acceptedAt = new Date().toISOString();
    handoff.auditTrail.push({
      action: 'HANDOFF_MANAGER_OVERRIDE',
      actor: `${actor.name} (${role})`,
      timestamp: new Date().toISOString(),
      detail: `Manager override executed. Reason: "${overrideReason}". Custodianship forcefully assigned to ${recipient.name}.`,
    });

    // ATOMIC OWNERSHIP TRANSFER
    if (handoff.taskId) {
      transferTaskOwnership(
        handoff.taskId,
        handoff.recipientId,
        actor,
        overrideReason,
        'Manager Override',
        handoff.id
      );
    }

    createAuditLog(
      actor.id,
      actor.name,
      'HANDOFF_MANAGER_OVERRIDE',
      `Manager override executed by ${actor.name} on handoff ${handoff.id}. Transferred to ${recipient.name}. Reason: ${overrideReason}`,
      handoff.projectName,
      { handoffId: handoff.id, taskId: handoff.taskId, recipientId: handoff.recipientId, overrideReason }
    );

    // Notify recipient
    createNotification(
      `Custodianship Assigned via Manager Override: ${handoff.id}`,
      `Manager ${actor.name} executed an operational override transferring "${handoff.projectName}" to you. Reason: "${overrideReason}"`,
      'handoff',
      handoff.recipientId,
      `/handoffs/${handoff.id}`
    );

    // Notify sender
    createNotification(
      `Handover Transferred via Manager Override: ${handoff.id}`,
      `Manager ${actor.name} completed handover transfer of "${handoff.projectName}" to ${recipient.name}.`,
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
