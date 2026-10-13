import { NextRequest, NextResponse } from 'next/server';
import {
  getStore,
  addTaskComment,
} from '@/lib/server-store';
import { requireUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;

  const { id } = await params;
  const store = getStore();

  let targetTask = null;
  for (const project of store.projects) {
    const found = (project.tasks || []).find((t) => t.id === id);
    if (found) {
      targetTask = found;
      break;
    }
  }

  if (!targetTask) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json(targetTask.comments || []);
}

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
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Comment text cannot be empty.' }, { status: 400 });
    }

    const result = addTaskComment(id, text.trim(), actor);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.comment, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
