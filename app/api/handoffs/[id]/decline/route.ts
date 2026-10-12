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
      { error: 'Forbidden: Only the designated recipient can decline this handoff.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { reason = 'Handover declined by recipient due to incomplete prerequisites or capacity.' } = body;

    handoff.status = 'Declined';
    handoff.declinedAt = new Date().toISOString();
    handoff.declineReason = reason;

    handoff.auditTrail.push({
      action: 'HANDOFF_DECLINED',
      actor: actor.name,
      timestamp: new Date().toISOString(),
      detail: `Handover declined by recipient. Reason: "${reason}". Ownership remains with original sender.`,
    });

    createAuditLog(
      actor.id,
      actor.name,
      'HANDOFF_DECLINED',
      `Handover ${handoff.id} declined by ${actor.name}. Reason: ${reason}.`,
      handoff.projectName,
      { handoffId: handoff.id, taskId: handoff.taskId, reason }
    );

    // Notify sender that handoff was declined
    createNotification(
      `Handover Declined: ${handoff.id}`,
      `${actor.name} declined the handover for "${handoff.projectName}"${handoff.taskTitle ? ` (${handoff.taskTitle})` : ''}. Reason: "${reason}". You remain the primary custodian.`,
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
