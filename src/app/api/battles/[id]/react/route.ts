// POST /api/battles/[id]/react — Stuur een crowd reaction
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { battleEngine } from '@/lib/battle-engine';
import { ReactionEmoji, REACTION_EMOJIS } from '@/lib/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const battle = store.getBattle(id);

  if (!battle) {
    return NextResponse.json({ error: 'Battle niet gevonden' }, { status: 404 });
  }

  if (battle.status !== 'live') {
    return NextResponse.json({ error: 'Battle is niet live' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { emoji, bot } = body as { emoji: ReactionEmoji; bot: 'bot1' | 'bot2' };

    // Valideer emoji
    if (!REACTION_EMOJIS[emoji]) {
      return NextResponse.json({ error: 'Ongeldige emoji' }, { status: 400 });
    }

    // Valideer bot keuze
    if (bot !== 'bot1' && bot !== 'bot2') {
      return NextResponse.json({ error: 'Ongeldige bot keuze' }, { status: 400 });
    }

    // Update reaction counts
    const reactions = battle.reactions || { bot1: 0, bot2: 0 };
    reactions[bot] += 1;
    store.updateBattle(id, { reactions });

    // Broadcast naar alle spectators via de engine's emit
    // We gebruiken de battleEngine.subscribe trick: emit gaat via de engine
    // Maar emit is private, dus we broadcasten via een directe SSE-achtige aanpak
    // Door de store te updaten en het event via de engine listener te sturen
    battleEngine.emitReaction(id, emoji, bot, reactions.bot1, reactions.bot2);

    return NextResponse.json({ ok: true, reactions });
  } catch {
    return NextResponse.json({ error: 'Ongeldige request' }, { status: 400 });
  }
}
