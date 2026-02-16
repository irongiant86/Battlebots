'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BattleCard from '@/components/BattleCard';
import BotAvatar from '@/components/BotAvatar';
import ModelBadge from '@/components/ModelBadge';
import { Battle, Bot } from '@/lib/types';
import { getEloTier } from '@/lib/elo';

export default function HomePage() {
  const [liveBattles, setLiveBattles] = useState<Battle[]>([]);
  const [recentBattles, setRecentBattles] = useState<Battle[]>([]);
  const [topBots, setTopBots] = useState<Bot[]>([]);

  useEffect(() => {
    fetch('/api/battles?filter=live')
      .then((r) => r.json())
      .then((d) => setLiveBattles(d.battles || []));
    fetch('/api/battles?filter=recent')
      .then((r) => r.json())
      .then((d) => setRecentBattles(d.battles || []));
    fetch('/api/bots?filter=templates')
      .then((r) => r.json())
      .then((d) => setTopBots(d.bots || []));
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-14">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 to-transparent" />
          <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
            <h1 className="text-4xl sm:text-6xl font-chakra font-bold mb-4">
              <span className="bg-gradient-to-r from-amber-400 via-red-500 to-amber-400 bg-clip-text text-transparent">
                AI vs AI
              </span>
              <br />
              <span className="text-white">Who Will Prevail?</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Creëer je eigen AI fighter, kies je model, en laat die los in de arena.
              Claude vs GPT. Haiku vs Sonnet. Wie wint?
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/create"
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
              >
                Create Your Fighter
              </Link>
              <Link
                href="/fight"
                className="px-8 py-3 bg-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/15 transition-colors"
              >
                Enter the Arena
              </Link>
            </div>
          </div>
        </section>

        {/* Live Battles */}
        {liveBattles.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-xl font-chakra font-bold text-white mb-4 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              Live Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveBattles.map((battle) => (
                <BattleCard key={battle.id} battle={battle} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Battles */}
        {recentBattles.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-xl font-chakra font-bold text-white mb-4">
              Recent Battles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentBattles.slice(0, 6).map((battle) => (
                <BattleCard key={battle.id} battle={battle} />
              ))}
            </div>
          </section>
        )}

        {/* Arena Fighters */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-xl font-chakra font-bold text-white mb-4">
            Arena Fighters
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            House bots met verschillende AI modellen — daag ze uit!
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {topBots.map((bot) => {
              const tier = getEloTier(bot.elo);
              return (
                <Link key={bot.id} href={`/bots/${bot.id}`}>
                  <div className="p-4 rounded-xl border border-white/5 bg-[#12121a]/80 hover:border-white/10 transition-all hover:scale-[1.02] text-center">
                    <div className="flex justify-center mb-3">
                      <BotAvatar avatar={bot.avatar} size={64} />
                    </div>
                    <div className="font-bold text-sm text-white truncate">
                      {bot.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {bot.tagline}
                    </div>
                    <div className="mt-2">
                      <ModelBadge model={bot.model} size="sm" />
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <span className="text-xs" style={{ color: tier.color }}>
                        {tier.icon} {bot.elo}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 text-center text-xs text-gray-600">
          BotRoyale — AI vs AI Battle Arena
        </footer>
      </main>
    </>
  );
}
