// POST /api/bots — Bot aanmaken
// GET /api/bots — Lijst van bots (public + templates)
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { Bot, CreateBotRequest, AI_MODELS, AIModel } from '@/lib/types';
import { generateId } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get('session')?.value;
  if (!sessionId) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }

  const userId = store.getUserIdBySession(sessionId);
  if (!userId) {
    return NextResponse.json({ error: 'Sessie verlopen' }, { status: 401 });
  }

  // Check bot limiet (max 5)
  if (store.getBotCount(userId) >= 5) {
    return NextResponse.json(
      { error: 'Je kunt maximaal 5 bots aanmaken' },
      { status: 400 }
    );
  }

  try {
    const body: CreateBotRequest = await req.json();

    // Validatie
    if (!body.name || body.name.trim().length < 2 || body.name.trim().length > 24) {
      return NextResponse.json({ error: 'Naam moet 2-24 tekens zijn' }, { status: 400 });
    }
    if (!body.tagline || body.tagline.trim().length > 80) {
      return NextResponse.json({ error: 'Tagline is verplicht (max 80 tekens)' }, { status: 400 });
    }
    if (body.personality?.systemPrompt && body.personality.systemPrompt.length > 1000) {
      return NextResponse.json({ error: 'System prompt max 1000 tekens' }, { status: 400 });
    }

    // Valideer gekozen model
    const model = body.model || 'claude-sonnet-4-5-20250929';
    if (!AI_MODELS[model as AIModel]) {
      return NextResponse.json({ error: 'Ongeldig AI model' }, { status: 400 });
    }

    const bot: Bot = {
      id: generateId(),
      ownerId: userId,
      name: body.name.trim(),
      tagline: body.tagline.trim(),
      avatar: body.avatar,
      personality: {
        systemPrompt: body.personality.systemPrompt || '',
        style: body.personality.style || 'custom',
        traits: body.personality.traits || [],
        catchphrase: body.personality.catchphrase || '',
      },
      model: model as AIModel,
      elo: 1200,
      wins: 0,
      losses: 0,
      draws: 0,
      battlesPlayed: 0,
      winStreak: 0,
      bestStreak: 0,
      fanCount: 0,
      createdAt: new Date(),
      isPublic: true,
      isTemplate: false,
    };

    store.createBot(bot);

    return NextResponse.json({ bot }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Ongeldige request' }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const filter = req.nextUrl.searchParams.get('filter');
  const ownerId = req.nextUrl.searchParams.get('owner');

  let bots: Bot[];

  if (filter === 'templates') {
    bots = store.getTemplateBots();
  } else if (ownerId) {
    bots = store.getBotsByOwner(ownerId);
  } else {
    bots = store.getPublicBots();
  }

  // Verberg system prompts van andere users
  const sessionId = req.cookies.get('session')?.value;
  const userId = sessionId ? store.getUserIdBySession(sessionId) : null;

  const safeBots = bots.map((bot) => ({
    ...bot,
    personality: {
      ...bot.personality,
      // Verberg system prompt voor andere users
      systemPrompt: bot.ownerId === userId ? bot.personality.systemPrompt : '[verborgen]',
    },
  }));

  return NextResponse.json({ bots: safeBots });
}
