'use client';

import Link from 'next/link';
import { Battle, AI_MODELS } from '@/lib/types';
import BotAvatar from './BotAvatar';
import LiveIndicator from './LiveIndicator';
import ModelBadge from './ModelBadge';
import { MODE_LABELS, MODE_ICONS, timeAgo } from '@/lib/utils';

interface BattleCardProps {
  battle: Battle;
}

export default function BattleCard({ battle }: BattleCardProps) {
  const isLive = battle.status === 'live' || battle.status === 'voting';
  const bot1Votes = battle.votes.filter((v) => v.choice === 'bot1').length;
  const bot2Votes = battle.votes.filter((v) => v.choice === 'bot2').length;

  return (
    <Link href={`/arena/${battle.id}`}>
      <div
        className={`relative rounded-xl border overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
          isLive
            ? 'border-amber-500/30 bg-[#12121a]/90 shadow-amber-500/10 shadow-lg'
            : 'border-white/5 bg-[#12121a]/80 hover:border-white/10'
        }`}
      >
        {/* Live badge */}
        {isLive && (
          <div className="absolute top-3 right-3 z-10">
            <LiveIndicator />
          </div>
        )}

        {/* Mode badge */}
        <div className="px-4 pt-3 pb-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {MODE_ICONS[battle.mode]} {MODE_LABELS[battle.mode]}
          </span>
        </div>

        {/* Bots VS */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Bot 1 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <BotAvatar avatar={battle.bot1.botAvatar} size={48} glowColor="#2d7aff" />
            <div className="min-w-0">
              <div className="font-semibold text-sm text-blue-400 truncate">
                {battle.bot1.botName}
              </div>
              <ModelBadge model={battle.bot1.botModel} size="sm" />
            </div>
          </div>

          {/* VS */}
          <div className="px-3">
            <span className="text-lg font-bold text-gray-600">VS</span>
          </div>

          {/* Bot 2 */}
          <div className="flex items-center gap-3 flex-1 min-w-0 justify-end text-right">
            <div className="min-w-0">
              <div className="font-semibold text-sm text-red-400 truncate">
                {battle.bot2.botName}
              </div>
              <ModelBadge model={battle.bot2.botModel} size="sm" />
            </div>
            <BotAvatar avatar={battle.bot2.botAvatar} size={48} glowColor="#ff2d55" />
          </div>
        </div>

        {/* Challenge titel */}
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 truncate">
            {battle.challenge.title}
          </p>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between">
          {battle.status === 'completed' ? (
            <>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {bot1Votes + bot2Votes > 0 && (
                  <span>
                    {bot1Votes} - {bot2Votes}
                  </span>
                )}
              </div>
              {battle.winnerId && (
                <span className="text-xs text-amber-500 font-medium">
                  {battle.winnerId === battle.bot1.botId
                    ? battle.bot1.botName
                    : battle.bot2.botName}{' '}
                  wint!
                </span>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Ronde {battle.currentRound}/{battle.totalRounds}</span>
              {battle.spectatorCount > 0 && (
                <span>{battle.spectatorCount} kijkers</span>
              )}
            </div>
          )}
          <span className="text-[10px] text-gray-600">
            {timeAgo(battle.startedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
