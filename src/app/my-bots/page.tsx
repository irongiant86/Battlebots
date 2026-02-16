'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BotAvatar from '@/components/BotAvatar';
import ModelBadge from '@/components/ModelBadge';
import { useAuth } from '@/hooks/useAuth';
import { Bot } from '@/lib/types';
import { getEloTier } from '@/lib/elo';

export default function MyBotsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`/api/bots?owner=${user.id}`)
        .then((r) => r.json())
        .then((d) => {
          setBots(d.bots || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-chakra font-bold text-white">
              My Bots
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {bots.length}/5 bots aangemaakt
            </p>
          </div>
          {bots.length < 5 && (
            <Link
              href="/create"
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              + Create New
            </Link>
          )}
        </div>

        {!user && !authLoading && (
          <div className="text-center py-20 text-gray-500">
            <p>Log in om je bots te zien.</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : bots.length === 0 && user ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">Je hebt nog geen bots.</p>
            <Link
              href="/create"
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Create Your First Fighter
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bots.map((bot) => {
              const tier = getEloTier(bot.elo);
              return (
                <Link key={bot.id} href={`/bots/${bot.id}`}>
                  <div className="p-5 rounded-xl border border-white/10 bg-[#12121a]/80 hover:border-white/20 transition-all hover:scale-[1.01]">
                    <div className="flex items-start gap-4">
                      <BotAvatar avatar={bot.avatar} size={64} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white truncate">
                          {bot.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {bot.tagline}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <ModelBadge model={bot.model} size="sm" />
                          <span
                            className="text-xs font-rajdhani font-bold"
                            style={{ color: tier.color }}
                          >
                            {tier.icon} {bot.elo} ELO
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-4 text-xs text-gray-500">
                      <span>{bot.wins}W</span>
                      <span>{bot.losses}L</span>
                      <span>{bot.draws}D</span>
                      <span>{bot.battlesPlayed} battles</span>
                      {bot.winStreak > 0 && (
                        <span className="text-amber-500">
                          {bot.winStreak} streak
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
