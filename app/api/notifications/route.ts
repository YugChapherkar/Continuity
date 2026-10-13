import { NextRequest, NextResponse } from 'next/server';
import { getStore, saveStore } from '@/lib/server-store';
import { requireUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actorId = auth.user.id;

  const store = getStore();

  let list = [...store.notifications];

  if (actorId) {
    list = list.filter((n) => !n.recipientId || n.recipientId === actorId);
  }

  return NextResponse.json(list);
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (auth.error) return auth.error;
    const actorId = auth.user.id;

    const body = await req.json();
    const { notificationId, markAllRead } = body;
    const store = getStore();

    if (markAllRead) {
      store.notifications.forEach((n) => {
        if (!actorId || !n.recipientId || n.recipientId === actorId) {
          n.read = true;
        }
      });
    } else if (notificationId) {
      const notif = store.notifications.find((n) => n.id === notificationId);
      if (notif) notif.read = true;
    }

    saveStore(store);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}

