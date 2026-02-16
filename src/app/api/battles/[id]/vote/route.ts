// POST /api/battles/[id]/vote — Stem uitbrengen
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { VoteRequest } from '@/lib/types';
import { battleEngine } from '@/lib/battle-engine';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionId = req.cookies.get('session')?.value;
  if (!sessionId) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }

  const userId = store.getUserIdBySession(sessionId);
  if (!userId) {
    return NextResponse.json({ error: 'Sessie verlopen' }, { status: 401 });
  }

  const { id } = await params;
  const battle = store.getBattle(id);
  if (!battle) {
    return NextResponse.json({ error: 'Battle niet gevonden' }, { status: 404 });
  }

  if (battle.status !== 'voting') {
    return NextResponse.json({ error: 'Voting is niet actief' }, { status: 400 });
  }

  try {
    const body: VoteRequest = await req.json();

    if (body.choice !== 'bot1' && body.choice !== 'bot2') {
      return NextResponse.json({ error: 'Ongeldige keuze' }, { status: 400 });
    }

    const success = store.addVote(id, {
      userId,
      choice: body.choice,
      votedAt: new Date(),
    });

    if (!success) {
      return NextResponse.json({ error: 'Je hebt al gestemd' }, { status: 400 });
    }

    // Check of we genoeg votes hebben om te finaliseren (auto na 3+ votes)
    const updatedBattle = store.getBattle(id)!;
    if (updatedBattle.votes.length >= 1) {
      // Voor MVP: finaliseer na minimaal 1 vote
      // In productie: wacht op timer of minimaal X votes
      setTimeout(() => {
        battleEngine.finalizeBattle(id);
      }, 5000); // 5 seconden wachten voor meer votes
    }

    return NextResponse.json({
      success: true,
      bot1Votes: updatedBattle.votes.filter((v) => v.choice === 'bot1').length,
      bot2Votes: updatedBattle.votes.filter((v) => v.choice === 'bot2').length,
    });
  } catch {
    return NextResponse.json({ error: 'Ongeldige request' }, { status: 400 });
  }
}
