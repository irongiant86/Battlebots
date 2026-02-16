// POST /api/battles — Start een battle
// GET /api/battles — Lijst van battles
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { Battle, StartBattleRequest, AI_MODELS } from '@/lib/types';
import { generateId, ROUNDS_PER_MODE } from '@/lib/utils';
import { getRandomChallenge, getChallenge } from '@/lib/challenges';
import { battleEngine } from '@/lib/battle-engine';

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get('session')?.value;
  if (!sessionId) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }

  const userId = store.getUserIdBySession(sessionId);
  if (!userId) {
    return NextResponse.json({ error: 'Sessie verlopen' }, { status: 401 });
  }

  try {
    const body: StartBattleRequest = await req.json();

    const bot1 = store.getBot(body.bot1Id);
    const bot2 = store.getBot(body.bot2Id);

    if (!bot1 || !bot2) {
      return NextResponse.json({ error: 'Bot niet gevonden' }, { status: 404 });
    }

    // Alleen eigen bot of template mag als bot1
    if (bot1.ownerId !== userId && !bot1.isTemplate) {
      return NextResponse.json({ error: 'Je kunt alleen met je eigen bot vechten' }, { status: 403 });
    }

    // Challenge selecteren
    const challenge =
      body.challengeIndex !== undefined
        ? getChallenge(body.mode, body.challengeIndex)
        : getRandomChallenge(body.mode);

    const battle: Battle = {
      id: generateId(),
      mode: body.mode,
      status: 'pending',
      challenge,
      bot1: {
        botId: bot1.id,
        botName: bot1.name,
        botAvatar: bot1.avatar,
        botModel: bot1.model,
        ownerId: bot1.ownerId,
      },
      bot2: {
        botId: bot2.id,
        botName: bot2.name,
        botAvatar: bot2.avatar,
        botModel: bot2.model,
        ownerId: bot2.ownerId,
      },
      rounds: [],
      currentRound: 0,
      totalRounds: ROUNDS_PER_MODE[body.mode] || 3,
      votes: [],
      winnerId: null,
      eloChange: 0,
      spectatorCount: 0,
      startedAt: new Date(),
      completedAt: null,
    };

    store.createBattle(battle);

    // Start de battle asynchroon
    battleEngine.runBattle(battle);

    return NextResponse.json({ battle }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Ongeldige request' }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const filter = req.nextUrl.searchParams.get('filter');

  if (filter === 'live') {
    return NextResponse.json({ battles: store.getLiveBattles() });
  }

  if (filter === 'recent') {
    return NextResponse.json({ battles: store.getRecentBattles() });
  }

  return NextResponse.json({ battles: store.getAllBattles() });
}
