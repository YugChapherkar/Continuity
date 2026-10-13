import { NextRequest, NextResponse } from 'next/server';
import {
  recordTaskBlocker,
  updateBlockerStatus,
} from '@/lib/server-store';
import { requireUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;

  const { id } = await params;

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
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;

  const { id } = await params;

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
