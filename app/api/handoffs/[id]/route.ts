import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/server-store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = getStore();
  const handoff = store.handoffs.find((h) => h.id === id);

  if (!handoff) {
    return NextResponse.json({ error: 'Handoff dossier not found' }, { status: 404 });
  }

  return NextResponse.json(handoff);
}
