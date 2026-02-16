'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BotAvatar from '@/components/BotAvatar';
import ModelBadge from '@/components/ModelBadge';
import BattleCard from '@/components/BattleCard';
import { Bot, Battle, AI_MODELS } from '@/lib/types';
import { getEloTier } from '@/lib/elo';

export default function BotProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [bot, setBot] = useState<Bot | null>(null);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bots/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setBot(d.bot || null);
        setBattles(d.battles || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-20 pb-12 px-4 max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
          </div>
        </main>
      </>
    );
  }

  if (!bot) {
    return (
      <>
        <Navbar />
        <main className="pt-20 pb-12 px-4 max-w-4xl mx-auto">
          <div className="text-center py-20 text-gray-500">
            Bot niet gevonden
          </div>
        </main>
      </>
    );
  }

  const tier = getEloTier(bot.elo);
  const modelConfig = AI_MODELS[bot.model];
  const winRate = bot.battlesPlayed > 0
    ? Math.round((bot.wins / bot.battlesPlayed) * 100)
    : 0;

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-4xl mx-auto">
        {/* Bot header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BotAvatar avatar={bot.avatar} size={120} />
          </div>
          <h1 className="text-3xl font-chakra font-bold text-white mb-1">
            {bot.name}
          </h1>
          <p className="text-gray-400 mb-3">{bot.tagline}</p>

          {/* Model badge */}
          <div className="flex justify-center mb-4">
            <ModelBadge model={bot.model} size="md" showProvider />
          </div>

          {bot.personality.catchphrase && (
            <p className="text-sm text-gray-600 italic mb-4">
              &ldquo;{bot.personality.catchphrase}&rdquo;
            </p>
          )}

          {/* Traits */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {bot.personality.traits.map((trait) => (
              <span
                key={trait}
                className="px-3 py-1 rounded-full text-xs bg-white/5 text-gray-400"
              >
                {trait}
              </span>
            ))}
          </div>

          <Link
            href="/fight"
            className="inline-block px-6 py-3 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Challenge This Bot
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="ELO Rating"
            value={bot.elo.toString()}
            detail={`${tier.icon} ${tier.name}`}
            color={tier.color}
          />
          <StatCard
            label="Win Rate"
            value={`${winRate}%`}
            detail={`${bot.wins}W ${bot.losses}L ${bot.draws}D`}
          />
          <StatCard
            label="Battles"
            value={bot.battlesPlayed.toString()}
            detail={`Best streak: ${bot.bestStreak}`}
          />
          <StatCard
            label="AI Model"
            value={modelConfig?.shortName || bot.model}
            detail={modelConfig?.provider || ''}
            color={modelConfig?.color}
          />
        </div>

        {/* Battle history */}
        {battles.length > 0 && (
          <div>
            <h2 className="text-lg font-chakra font-bold text-white mb-4">
              Battle History
            </h2>
            <div className="space-y-3">
              {battles.map((battle) => (
                <BattleCard key={battle.id} battle={battle} />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  detail,
  color,
}: {
  label: string;
  value: string;
  detail: string;
  color?: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-white/5 bg-[#12121a]/80 text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div
        className="text-2xl font-rajdhani font-bold"
        style={{ color: color || 'white' }}
      >
        {value}
      </div>
      <div className="text-[10px] text-gray-600 mt-0.5">{detail}</div>
    </div>
  );
}
