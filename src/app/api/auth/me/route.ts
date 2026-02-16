// GET /api/auth/me — Huidige user ophalen via session cookie
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('session')?.value;
  if (!sessionId) {
    return NextResponse.json({ user: null });
  }

  const userId = store.getUserIdBySession(sessionId);
  if (!userId) {
    return NextResponse.json({ user: null });
  }

  const user = store.getUser(userId);
  return NextResponse.json({ user: user || null });
}
