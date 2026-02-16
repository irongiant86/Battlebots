// POST /api/battles — Start een battle
// GET /api/battles — Lijst van battles
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { Battle, BattleChallenge, BattleMode, StartBattleRequest, AI_MODELS } from '@/lib/types';
import { generateId, ROUNDS_PER_MODE } from '@/lib/utils';
import { getRandomChallenge, getChallenge } from '@/lib/challenges';
import { battleEngine } from '@/lib/battle-engine';

export async function POST(req: NextRequest) {
  console.log('[battles/POST] Battle start request ontvangen');

  const sessionId = req.cookies.get('session')?.value;
  if (!sessionId) {
    console.log('[battles/POST] Geen session cookie gevonden');
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }

  const userId = store.getUserIdBySession(sessionId);
  if (!userId) {
    console.log('[battles/POST] Sessie niet gevonden in store:', sessionId);
    return NextResponse.json({ error: 'Sessie verlopen' }, { status: 401 });
  }

  console.log('[battles/POST] User:', userId);

  try {
    const body: StartBattleRequest = await req.json();
    console.log('[battles/POST] Request body:', JSON.stringify(body));

    const bot1 = store.getBot(body.bot1Id);
    const bot2 = store.getBot(body.bot2Id);

    if (!bot1 || !bot2) {
      console.log('[battles/POST] Bot niet gevonden:', body.bot1Id, body.bot2Id);
      return NextResponse.json({ error: 'Bot niet gevonden' }, { status: 404 });
    }

    // Alleen eigen bot of template mag als bot1
    if (bot1.ownerId !== userId && !bot1.isTemplate) {
      console.log('[battles/POST] Geen toegang tot bot1:', bot1.ownerId, 'vs user:', userId);
      return NextResponse.json({ error: 'Je kunt alleen met je eigen bot vechten' }, { status: 403 });
    }

    // Challenge selecteren — custom topic of random
    let challenge;
    const customTopic = body.customTopic?.trim();
    if (customTopic && customTopic.length >= 3 && customTopic.length <= 200) {
      challenge = buildCustomChallenge(body.mode, customTopic);
    } else {
      challenge =
        body.challengeIndex !== undefined
          ? getChallenge(body.mode, body.challengeIndex)
          : getRandomChallenge(body.mode);
    }

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
      reactions: { bot1: 0, bot2: 0 },
      spectatorCount: 0,
      startedAt: new Date(),
      completedAt: null,
    };

    store.createBattle(battle);
    console.log('[battles/POST] Battle aangemaakt:', battle.id, battle.mode);
    console.log('[battles/POST] Bot1:', bot1.name, '(' + bot1.model + ') vs Bot2:', bot2.name, '(' + bot2.model + ')');

    // Start de battle asynchroon (fire-and-forget)
    battleEngine.runBattle(battle).catch((err) => {
      console.error('[battles/POST] Battle engine crash:', err);
    });

    return NextResponse.json({ battle }, { status: 201 });
  } catch (err) {
    console.error('[battles/POST] Ongeldige request:', err);
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

// Bouw een custom challenge op basis van een door de gebruiker ingebracht onderwerp
function buildCustomChallenge(mode: BattleMode, topic: string): BattleChallenge {
  switch (mode) {
    case 'debate':
      return {
        title: topic.length > 40 ? topic.slice(0, 40) + '...' : topic,
        description: 'Door kijker ingebracht onderwerp',
        mode,
        topic,
      };
    case 'creative':
      return {
        title: topic.length > 40 ? topic.slice(0, 40) + '...' : topic,
        description: 'Door kijker ingebrachte opdracht',
        mode,
        task: topic,
      };
    case 'roast':
      return {
        title: topic.length > 40 ? topic.slice(0, 40) + '...' : topic,
        description: 'Door kijker ingebracht thema',
        mode,
        topic,
      };
    case 'puzzle':
      return {
        title: topic.length > 40 ? topic.slice(0, 40) + '...' : topic,
        description: 'Door kijker ingebrachte puzzel',
        mode,
        task: topic,
      };
    case 'improv':
      return {
        title: topic.length > 40 ? topic.slice(0, 40) + '...' : topic,
        description: 'Door kijker ingebracht scenario',
        mode,
        scenario: topic,
      };
    case 'kennismaken':
      return {
        title: topic.length > 40 ? topic.slice(0, 40) + '...' : topic,
        description: 'Door kijker ingebracht gespreksthema',
        mode,
        scenario: topic,
      };
    default:
      return {
        title: topic.length > 40 ? topic.slice(0, 40) + '...' : topic,
        description: 'Door kijker ingebracht onderwerp',
        mode,
        topic,
      };
  }
}
