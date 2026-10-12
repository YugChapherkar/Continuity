import { NextRequest, NextResponse } from 'next/server';
import { getStore, getUserById } from '@/lib/server-store';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id') || req.nextUrl.searchParams.get('userId');
  const store = getStore();

  if (!userId) {
    // Default to first active user if not specified
    const defaultUser = store.users[0];
    return NextResponse.json(defaultUser);
  }

  const user = getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}
