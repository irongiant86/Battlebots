// POST /api/auth/login — Username login met session cookie
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { generateId } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username || typeof username !== 'string' || username.trim().length < 2) {
      return NextResponse.json(
        { error: 'Username moet minimaal 2 tekens zijn' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().slice(0, 24);

    // Check of user al bestaat
    let user = store.getUserByUsername(cleanUsername);
    if (!user) {
      user = store.createUser(generateId(), cleanUsername);
    }

    // Maak session
    const sessionId = generateId();
    store.createSession(sessionId, user.id);
    console.log(`[auth/login] User ingelogd: ${user.username} (${user.id}), session: ${sessionId}`);

    const response = NextResponse.json({ user });
    response.cookies.set('session', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 dagen
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Ongeldige request' }, { status: 400 });
  }
}
