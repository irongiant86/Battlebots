// GET /api/bots/[id] — Bot details + stats
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bot = store.getBot(id);

  if (!bot) {
    return NextResponse.json({ error: 'Bot niet gevonden' }, { status: 404 });
  }

  // Verberg system prompt
  const sessionId = req.cookies.get('session')?.value;
  const userId = sessionId ? store.getUserIdBySession(sessionId) : null;

  const safeBot = {
    ...bot,
    personality: {
      ...bot.personality,
      systemPrompt: bot.ownerId === userId ? bot.personality.systemPrompt : '[verborgen]',
    },
  };

  const battles = store.getBattlesByBot(id);

  return NextResponse.json({ bot: safeBot, battles });
}
