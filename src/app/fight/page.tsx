'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ModeSelector from '@/components/ModeSelector';
import BotAvatar from '@/components/BotAvatar';
import ModelBadge from '@/components/ModelBadge';
import { useAuth } from '@/hooks/useAuth';
import { Bot, BattleMode } from '@/lib/types';
import { getEloTier } from '@/lib/elo';

export default function FightPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [myBots, setMyBots] = useState<Bot[]>([]);
  const [publicBots, setPublicBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [selectedMode, setSelectedMode] = useState<BattleMode | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<Bot | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (user) {
      fetch(`/api/bots?owner=${user.id}`)
        .then((r) => r.json())
        .then((d) => setMyBots(d.bots || []));
    }
    fetch('/api/bots')
      .then((r) => r.json())
      .then((d) => setPublicBots(d.bots || []));
  }, [user]);

  const startBattle = async () => {
    if (!selectedBot || !selectedMode || !selectedOpponent) return;
    setStarting(true);

    try {
      const res = await fetch('/api/battles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot1Id: selectedBot.id,
          bot2Id: selectedOpponent.id,
          mode: selectedMode,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/arena/${data.battle.id}`);
      }
    } catch {
      setStarting(false);
    }
  };

  const availableOpponents = publicBots.filter(
    (b) => b.id !== selectedBot?.id
  );

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-chakra font-bold text-white mb-2 text-center">
          Enter the Arena
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Kies je fighter, mode en tegenstander
        </p>

        {/* Step 1: Kies je bot */}
        {step >= 1 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">
              1. Kies je Fighter
            </h2>

            {!user && (
              <p className="text-sm text-gray-500 mb-4">
                Log in om met je eigen bots te vechten, of kies een house bot.
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {myBots.map((bot) => (
                <BotSelectCard
                  key={bot.id}
                  bot={bot}
                  selected={selectedBot?.id === bot.id}
                  onClick={() => {
                    setSelectedBot(bot);
                    if (step === 1) setStep(2);
                  }}
                  label="Jouw bot"
                />
              ))}
              {publicBots
                .filter((b) => b.isTemplate)
                .map((bot) => (
                  <BotSelectCard
                    key={bot.id}
                    bot={bot}
                    selected={selectedBot?.id === bot.id}
                    onClick={() => {
                      setSelectedBot(bot);
                      if (step === 1) setStep(2);
                    }}
                    label="House bot"
                  />
                ))}
            </div>
          </div>
        )}

        {/* Step 2: Kies mode */}
        {step >= 2 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">
              2. Kies Battle Mode
            </h2>
            <ModeSelector
              value={selectedMode}
              onChange={(mode) => {
                setSelectedMode(mode);
                if (step === 2) setStep(3);
              }}
            />
          </div>
        )}

        {/* Step 3: Kies tegenstander */}
        {step >= 3 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">
              3. Kies Tegenstander
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableOpponents.map((bot) => (
                <BotSelectCard
                  key={bot.id}
                  bot={bot}
                  selected={selectedOpponent?.id === bot.id}
                  onClick={() => setSelectedOpponent(bot)}
                  showModel
                />
              ))}
            </div>
          </div>
        )}

        {/* Start battle */}
        {selectedBot && selectedMode && selectedOpponent && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <BotAvatar
                  avatar={selectedBot.avatar}
                  size={64}
                  glowColor="#2d7aff"
                />
                <div className="text-sm text-blue-400 font-bold mt-2">
                  {selectedBot.name}
                </div>
                <ModelBadge model={selectedBot.model} size="sm" />
              </div>
              <span className="text-2xl font-bold text-gray-600 vs-divider">
                VS
              </span>
              <div className="text-center">
                <BotAvatar
                  avatar={selectedOpponent.avatar}
                  size={64}
                  glowColor="#ff2d55"
                />
                <div className="text-sm text-red-400 font-bold mt-2">
                  {selectedOpponent.name}
                </div>
                <ModelBadge model={selectedOpponent.model} size="sm" />
              </div>
            </div>
            <button
              onClick={startBattle}
              disabled={starting}
              className="px-12 py-4 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {starting ? 'Starting...' : 'START BATTLE'}
            </button>
          </div>
        )}
      </main>
    </>
  );
}

function BotSelectCard({
  bot,
  selected,
  onClick,
  label,
  showModel,
}: {
  bot: Bot;
  selected: boolean;
  onClick: () => void;
  label?: string;
  showModel?: boolean;
}) {
  const tier = getEloTier(bot.elo);

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl border-2 text-center transition-all ${
        selected
          ? 'border-amber-500 bg-amber-500/10'
          : 'border-white/10 hover:border-white/20 bg-white/5'
      }`}
    >
      <div className="flex justify-center mb-2">
        <BotAvatar avatar={bot.avatar} size={48} />
      </div>
      <div className="font-semibold text-sm text-white truncate">
        {bot.name}
      </div>
      {label && (
        <div className="text-[10px] text-gray-600 mt-0.5">{label}</div>
      )}
      {showModel && (
        <div className="mt-1">
          <ModelBadge model={bot.model} size="sm" />
        </div>
      )}
      <div className="mt-1 text-xs" style={{ color: tier.color }}>
        {tier.icon} {bot.elo}
      </div>
    </button>
  );
}
