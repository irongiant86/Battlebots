// GET /api/rankings — Leaderboard
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getEloTier } from '@/lib/elo';

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
  const mode = req.nextUrl.searchParams.get('mode');

  let bots = store.getTopBots(limit);

  // Filter op mode als opgegeven (op basis van battle history)
  if (mode) {
    const botsWithModeWins = bots.filter((bot) => {
      const battles = store.getBattlesByBot(bot.id);
      return battles.some((b) => b.mode === mode);
    });
    bots = botsWithModeWins;
  }

  const rankings = bots.map((bot, index) => ({
    rank: index + 1,
    bot: {
      id: bot.id,
      name: bot.name,
      tagline: bot.tagline,
      avatar: bot.avatar,
      model: bot.model,
      ownerId: bot.ownerId,
      elo: bot.elo,
      wins: bot.wins,
      losses: bot.losses,
      draws: bot.draws,
      battlesPlayed: bot.battlesPlayed,
      winStreak: bot.winStreak,
      bestStreak: bot.bestStreak,
      fanCount: bot.fanCount,
    },
    tier: getEloTier(bot.elo),
    winRate: bot.battlesPlayed > 0
      ? Math.round((bot.wins / bot.battlesPlayed) * 100)
      : 0,
  }));

  return NextResponse.json({ rankings });
}
