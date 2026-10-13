import { NextRequest, NextResponse } from 'next/server';
import {
  getStore,
  saveStore,
  getEffectiveRole,
  createAuditLog,
  createNotification,
} from '@/lib/server-store';
import { requireUser } from '@/lib/auth';
import { ClientDeliveryRecord } from '@/lib/types';

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;
  const store = getStore();

  const searchParams = req.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');

  let list = [...store.deliveries];

  if (actor) {
    const role = getEffectiveRole(actor);
    // Admin sees all deliveries
    // Team Leader / Employee see deliveries for projects they have access to
    if (role !== 'Admin') {
      const authorizedProjectIds = new Set(
        store.projects
          .filter((p) => p.teamLeaderId === actor.id || p.teamId === actor.teamId)
          .map((p) => p.id)
      );
      list = list.filter((d) => authorizedProjectIds.has(d.projectId));
    }
  }

  if (projectId) {
    list = list.filter((d) => d.projectId === projectId);
  }

  list.sort((a, b) => new Date(b.deliveredAt).getTime() - new Date(a.deliveredAt).getTime());
  return NextResponse.json(list);
}

// POST: Admin records final client release delivery
export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;

  if (!actor || getEffectiveRole(actor) !== 'Admin') {
    return NextResponse.json(
      { error: 'Forbidden: Only an authorized Admin can record client release delivery.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      projectId,
      deliveredVersion,
      deliveredAt,
      recipientContact,
      deliveryChannel,
      deliveryNotes,
      deliverablesList = [],
      clientAcknowledged = false,
      clientAcknowledgmentNotes,
    } = body;

    if (!projectId || !recipientContact || !deliveryChannel || !deliveryNotes) {
      return NextResponse.json(
        {
          error:
            'Project ID, recipient contact, delivery channel/method, and delivery notes are required.',
        },
        { status: 400 }
      );
    }

    const store = getStore();
    const project = store.projects.find((p) => p.id === projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    // Verify project has been approved for delivery
    if (project.status !== 'Approved for Delivery' && project.status !== 'Delivered') {
      return NextResponse.json(
        {
          error: `Cannot record client delivery for project in "${project.status}" state. The deliverable must first be formally reviewed and approved by an Admin.`,
        },
        { status: 400 }
      );
    }

    const versionToRecord = deliveredVersion || project.currentVersionId || 'v1.0.0';
    const id = `DELIV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    const deliveryRecord: ClientDeliveryRecord = {
      id,
      projectId: project.id,
      projectName: project.name,
      approvedVersion: versionToRecord,
      deliveredAt: deliveredAt || new Date().toISOString(),
      recipientContact,
      deliveryChannel,
      deliveryNotes,
      deliverablesList: Array.isArray(deliverablesList) ? deliverablesList : [deliverablesList],
      recordedBy: actor.id,
      recordedByName: actor.name,
      clientAcknowledged: Boolean(clientAcknowledged),
      clientAcknowledgmentNotes: clientAcknowledgmentNotes || undefined,
      createdAt: new Date().toISOString(),
    };

    store.deliveries.unshift(deliveryRecord);

    // Update project lifecycle status to Delivered
    project.status = 'Delivered';
    project.deliveryRecord = deliveryRecord;
    project.health = 'Green';
    project.healthReasons = [
      `Delivered to ${project.client || 'Client'} (${versionToRecord}) on ${deliveryRecord.deliveredAt.split('T')[0]}`,
    ];
    project.updatedAt = new Date().toISOString();

    if (project.reviewSubmission) {
      project.reviewSubmission.status = 'Delivered';
      project.reviewSubmission.updatedAt = new Date().toISOString();
    }

    // Notify Team Leader
    if (project.teamLeaderId) {
      createNotification(
        'Client Delivery Recorded',
        `Admin ${actor.name} formally recorded client delivery of ${project.name} to ${recipientContact}.`,
        'delivery',
        project.teamLeaderId,
        `/projects/${project.id}`
      );
    }

    createAuditLog(
      actor.id,
      actor.name,
      'CLIENT_DELIVERY_RECORDED',
      `Admin ${actor.name} recorded client release delivery for "${project.name}" (Version: ${versionToRecord}, Recipient: ${recipientContact}, Channel: ${deliveryChannel}).`,
      project.name,
      {
        deliveryId: id,
        projectId: project.id,
        approvedVersion: versionToRecord,
        recipientContact,
        clientAcknowledged,
      }
    );

    saveStore(store);
    return NextResponse.json(deliveryRecord, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}

// PATCH: Record client acknowledgment or acceptance evidence
export async function PATCH(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;

  if (!actor || getEffectiveRole(actor) !== 'Admin') {
    return NextResponse.json(
      { error: 'Forbidden: Only an authorized Admin can update delivery acceptance records.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { deliveryId, clientAcknowledged, clientAcknowledgmentNotes } = body;

    if (!deliveryId) {
      return NextResponse.json({ error: 'Delivery ID is required' }, { status: 400 });
    }

    const store = getStore();
    const record = store.deliveries.find((d) => d.id === deliveryId);
    if (!record) {
      return NextResponse.json({ error: 'Delivery record not found.' }, { status: 404 });
    }

    if (clientAcknowledged !== undefined) {
      record.clientAcknowledged = Boolean(clientAcknowledged);
    }
    if (clientAcknowledgmentNotes) {
      record.clientAcknowledgmentNotes = clientAcknowledgmentNotes;
    }

    // Update in project too
    const project = store.projects.find((p) => p.id === record.projectId);
    if (project && project.deliveryRecord) {
      project.deliveryRecord = record;
    }

    createAuditLog(
      actor.id,
      actor.name,
      'CLIENT_DELIVERY_RECORDED',
      `Admin ${actor.name} updated client acknowledgment for "${record.projectName}" (Acknowledged: ${record.clientAcknowledged}).`,
      record.projectName,
      { deliveryId, clientAcknowledged: record.clientAcknowledged }
    );

    saveStore(store);
    return NextResponse.json(record);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}
