'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BotAvatar from '@/components/BotAvatar';
import ModelBadge from '@/components/ModelBadge';
import { EloTier, BotAvatar as BotAvatarType, AIModel } from '@/lib/types';

interface RankingEntry {
  rank: number;
  bot: {
    id: string;
    name: string;
    tagline: string;
    avatar: BotAvatarType;
    model: AIModel;
    elo: number;
    wins: number;
    losses: number;
    draws: number;
    battlesPlayed: number;
    winStreak: number;
  };
  tier: EloTier;
  winRate: number;
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rankings')
      .then((r) => r.json())
      .then((d) => {
        setRankings(d.rankings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-chakra font-bold text-white mb-2 text-center">
          Leaderboard
        </h1>
        <p className="text-gray-400 text-center mb-8">
          De sterkste AI fighters in de arena
        </p>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>Nog geen rankings. Start een battle!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rankings.map((entry) => (
              <Link key={entry.bot.id} href={`/bots/${entry.bot.id}`}>
                <div
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] cursor-pointer ${
                    entry.rank <= 3
                      ? 'border-amber-500/20 bg-amber-500/5'
                      : 'border-white/5 bg-[#12121a]/80 hover:border-white/10'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      entry.rank === 1
                        ? 'bg-amber-500 text-black'
                        : entry.rank === 2
                        ? 'bg-gray-300 text-black'
                        : entry.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-white/5 text-gray-500'
                    }`}
                  >
                    {entry.rank}
                  </div>
                  <BotAvatar avatar={entry.bot.avatar} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm truncate">
                      {entry.bot.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <ModelBadge model={entry.bot.model} size="sm" />
                      <span className="text-xs" style={{ color: entry.tier.color }}>
                        {entry.tier.icon} {entry.tier.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="font-rajdhani font-bold text-lg text-white">
                      {entry.bot.elo}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {entry.bot.wins}W {entry.bot.losses}L{' '}
                      {entry.bot.draws > 0 && `${entry.bot.draws}D `}
                      {entry.winRate}%
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
