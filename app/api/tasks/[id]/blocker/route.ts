import { NextRequest, NextResponse } from 'next/server';
import {
  getUserById,
  recordTaskBlocker,
  updateBlockerStatus,
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

  try {
    const body = await req.json();
    const { description, severity = 'High' } = body;

    if (!description) {
      return NextResponse.json({ error: 'Blocker description is required.' }, { status: 400 });
    }

    const result = recordTaskBlocker(id, description, severity, actor);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.task, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const actorId = req.headers.get('x-user-id') || 'user-marcus';
  const actor = getUserById(actorId);

  if (!actor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, notes, reason } = body;

    if (!action || !['acknowledge', 'escalate', 'resolve'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action ("acknowledge", "escalate", or "resolve") is required.' },
        { status: 400 }
      );
    }

    const result = updateBlockerStatus(id, action, actor, { notes, reason });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.task, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
