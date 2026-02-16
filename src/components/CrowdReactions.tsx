'use client';

import { useState } from 'react';
import { ReactionEmoji, REACTION_EMOJIS } from '@/lib/types';

interface CrowdReactionsProps {
  bot1Name: string;
  bot2Name: string;
  bot1Count: number;
  bot2Count: number;
  onReact: (emoji: ReactionEmoji, bot: 'bot1' | 'bot2') => void;
}

const REACTION_KEYS: ReactionEmoji[] = ['fire', 'skull', 'laugh', 'crown'];

export default function CrowdReactions({
  bot1Name,
  bot2Name,
  bot1Count,
  bot2Count,
  onReact,
}: CrowdReactionsProps) {
  const [cooldown, setCooldown] = useState(false);

  const handleReact = (emoji: ReactionEmoji, bot: 'bot1' | 'bot2') => {
    if (cooldown) return;
    onReact(emoji, bot);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 1000);
  };

  const total = bot1Count + bot2Count;
  const bot1Pct = total > 0 ? Math.round((bot1Count / total) * 100) : 50;
  const bot2Pct = total > 0 ? 100 - bot1Pct : 50;

  return (
    <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-3 text-center font-bold">
        Crowd Hype
      </div>

      {/* Hype meter */}
      {total > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-blue-400 w-8 text-right">{bot1Count}</span>
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden flex">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${bot1Pct}%` }}
            />
            <div
              className="h-full bg-red-500 transition-all duration-500"
              style={{ width: `${bot2Pct}%` }}
            />
          </div>
          <span className="text-[10px] text-red-400 w-8">{bot2Count}</span>
        </div>
      )}

      {/* Reaction buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Bot 1 reactions */}
        <div className="flex justify-center gap-1.5">
          {REACTION_KEYS.map((emoji) => (
            <button
              key={`bot1-${emoji}`}
              onClick={() => handleReact(emoji, 'bot1')}
              disabled={cooldown}
              className="w-9 h-9 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 transition-all text-base disabled:opacity-30 hover:scale-110 active:scale-95"
              title={`${REACTION_EMOJIS[emoji]} voor ${bot1Name}`}
            >
              {REACTION_EMOJIS[emoji]}
            </button>
          ))}
        </div>
        {/* Bot 2 reactions */}
        <div className="flex justify-center gap-1.5">
          {REACTION_KEYS.map((emoji) => (
            <button
              key={`bot2-${emoji}`}
              onClick={() => handleReact(emoji, 'bot2')}
              disabled={cooldown}
              className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all text-base disabled:opacity-30 hover:scale-110 active:scale-95"
              title={`${REACTION_EMOJIS[emoji]} voor ${bot2Name}`}
            >
              {REACTION_EMOJIS[emoji]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
