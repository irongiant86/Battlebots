// GET /api/battles/[id]/stream — SSE stream voor live battle updates
import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { battleEngine } from '@/lib/battle-engine';
import { BattleEvent } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const battle = store.getBattle(id);

  if (!battle) {
    return new Response('Battle niet gevonden', { status: 404 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: BattleEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          // Stream gesloten
        }
      };

      // Stuur huidige state als eerste event
      send({
        type: 'spectator_count',
        count: (battle.spectatorCount || 0) + 1,
      });

      // Update spectator count
      store.updateBattle(id, {
        spectatorCount: (battle.spectatorCount || 0) + 1,
      });

      // Registreer als listener VOOR replay — voorkomt race condition
      // waarbij een ronde compleet wordt tussen snapshot en subscribe
      const unsubscribe = battleEngine.subscribe(id, send);

      // Replay bestaande rondes (client dedupliceeert op roundnummer)
      const freshBattle = store.getBattle(id);
      if (freshBattle && freshBattle.rounds.length > 0) {
        for (const round of freshBattle.rounds) {
          if (round.bot1Response && round.bot2Response) {
            send({
              type: 'round_complete',
              round: round.roundNumber,
              bot1Response: round.bot1Response,
              bot2Response: round.bot2Response,
            });
            if (round.commentary) {
              send({
                type: 'commentary',
                round: round.roundNumber,
                text: round.commentary,
              });
            }
          }
        }
      }

      // Als battle al klaar is
      if (freshBattle?.status === 'voting') {
        send({ type: 'voting_start' });
      } else if (freshBattle?.status === 'completed') {
        send({ type: 'battle_complete', winnerId: freshBattle.winnerId });
      }

      // Cleanup bij disconnect
      req.signal.addEventListener('abort', () => {
        unsubscribe();
        const currentBattle = store.getBattle(id);
        if (currentBattle) {
          store.updateBattle(id, {
            spectatorCount: Math.max(0, (currentBattle.spectatorCount || 1) - 1),
          });
        }
        try {
          controller.close();
        } catch {
          // Al gesloten
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
