import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/server-store';

export async function GET(req: NextRequest) {
  const store = getStore();
  const searchParams = req.nextUrl.searchParams;
  const action = searchParams.get('action');
  const limit = Number(searchParams.get('limit')) || 100;

  let list = [...store.auditLogs];

  if (action) {
    list = list.filter((log) => log.action === action);
  }

  return NextResponse.json(list.slice(0, limit));
}
