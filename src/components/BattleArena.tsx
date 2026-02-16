'use client';

import { useState } from 'react';
import { useBattle } from '@/hooks/useBattle';
import BotAvatar from './BotAvatar';
import ModelBadge from './ModelBadge';
import LiveIndicator from './LiveIndicator';
import RoundCounter from './RoundCounter';
import TypewriterText from './TypewriterText';
import VoteBar from './VoteBar';
import CrowdReactions from './CrowdReactions';
import { MODE_LABELS, MODE_ICONS } from '@/lib/utils';

interface BattleArenaProps {
  battleId: string;
}

export default function BattleArena({ battleId }: BattleArenaProps) {
  const {
    battle,
    loading,
    connected,
    liveText,
    currentRound,
    currentBot,
    currentBotModel,
    status,
    winnerId,
    spectatorCount,
    completedRounds,
    liveCommentary,
    reactionCounts,
    sendReaction,
  } = useBattle(battleId);

  const [voted, setVoted] = useState<'bot1' | 'bot2' | null>(null);
  const [voteError, setVoteError] = useState('');

  const handleVote = async (choice: 'bot1' | 'bot2') => {
    try {
      const res = await fetch(`/api/battles/${battleId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice }),
      });
      if (res.ok) {
        setVoted(choice);
      } else {
        const data = await res.json();
        setVoteError(data.error || 'Kon niet stemmen');
      }
    } catch {
      setVoteError('Netwerkfout');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Arena laden...</p>
        </div>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Battle niet gevonden</p>
      </div>
    );
  }

  const bot1Votes = battle.votes?.filter((v) => v.choice === 'bot1').length || 0;
  const bot2Votes = battle.votes?.filter((v) => v.choice === 'bot2').length || 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-lg">
            {MODE_ICONS[battle.mode]}
          </span>
          <h1 className="text-xl font-chakra font-bold text-white">
            {MODE_LABELS[battle.mode]}
          </h1>
          {(status === 'live' || status === 'voting') && <LiveIndicator />}
        </div>
        <p className="text-sm text-gray-400">{battle.challenge.title}</p>
        {battle.challenge.description && (
          <p className="text-xs text-gray-600 mt-1">
            {battle.challenge.description}
          </p>
        )}
      </div>

      {/* Round counter + spectators */}
      <div className="flex items-center justify-between mb-4">
        <RoundCounter current={currentRound} total={battle.totalRounds} />
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {spectatorCount > 0 && <span>{spectatorCount} kijkers</span>}
          {connected && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Verbonden
            </span>
          )}
        </div>
      </div>

      {/* Split screen arena */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Bot 1 — Blauw */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 overflow-hidden">
          <div className="p-4 border-b border-blue-500/10 flex items-center gap-3">
            <BotAvatar avatar={battle.bot1.botAvatar} size={48} glowColor="#2d7aff" />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-blue-400 truncate">
                {battle.bot1.botName}
              </div>
              <ModelBadge model={battle.bot1.botModel} size="sm" />
            </div>
            {currentBot === battle.bot1.botName && status === 'live' && (
              <span className="text-xs text-blue-400 animate-pulse">
                denkt na...
              </span>
            )}
          </div>
          <div className="p-4 min-h-[200px] max-h-[500px] overflow-y-auto">
            {/* Voltooide rondes */}
            {completedRounds.map((round) => (
              <div key={round.round} className="mb-4">
                <div className="text-[10px] text-blue-500/50 uppercase tracking-wider mb-1">
                  Ronde {round.round}
                </div>
                <p className="text-sm text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {round.bot1Response}
                </p>
              </div>
            ))}
            {/* Live tekst */}
            {liveText.bot1 && (
              <div>
                <div className="text-[10px] text-blue-500/50 uppercase tracking-wider mb-1">
                  Ronde {currentRound}
                </div>
                <TypewriterText
                  text={liveText.bot1}
                  className="text-blue-100"
                />
              </div>
            )}
          </div>
        </div>

        {/* Bot 2 — Rood */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden">
          <div className="p-4 border-b border-red-500/10 flex items-center gap-3">
            <BotAvatar avatar={battle.bot2.botAvatar} size={48} glowColor="#ff2d55" />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-red-400 truncate">
                {battle.bot2.botName}
              </div>
              <ModelBadge model={battle.bot2.botModel} size="sm" />
            </div>
            {currentBot === battle.bot2.botName && status === 'live' && (
              <span className="text-xs text-red-400 animate-pulse">
                denkt na...
              </span>
            )}
          </div>
          <div className="p-4 min-h-[200px] max-h-[500px] overflow-y-auto">
            {completedRounds.map((round) => (
              <div key={round.round} className="mb-4">
                <div className="text-[10px] text-red-500/50 uppercase tracking-wider mb-1">
                  Ronde {round.round}
                </div>
                <p className="text-sm text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {round.bot2Response}
                </p>
              </div>
            ))}
            {liveText.bot2 && (
              <div>
                <div className="text-[10px] text-red-500/50 uppercase tracking-wider mb-1">
                  Ronde {currentRound}
                </div>
                <TypewriterText
                  text={liveText.bot2}
                  className="text-red-100"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Commentator */}
      {liveCommentary && status === 'live' && (
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🎙️</span>
            <span className="text-[10px] text-amber-500/70 uppercase tracking-wider font-bold">
              Commentator
            </span>
          </div>
          <p className="text-sm text-amber-200/90 italic leading-relaxed">
            {liveCommentary}
          </p>
        </div>
      )}

      {/* Completed round commentaries */}
      {completedRounds.some((r) => r.commentary) && status !== 'live' && (
        <div className="mb-6 space-y-2">
          {completedRounds.filter((r) => r.commentary).map((round) => (
            <div key={`commentary-${round.round}`} className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs">🎙️</span>
                <span className="text-[10px] text-amber-500/50 uppercase tracking-wider">
                  Commentaar ronde {round.round}
                </span>
              </div>
              <p className="text-xs text-amber-200/70 italic">
                {round.commentary}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Crowd Reactions */}
      {status === 'live' && (
        <CrowdReactions
          bot1Name={battle.bot1.botName}
          bot2Name={battle.bot2.botName}
          bot1Count={reactionCounts.bot1}
          bot2Count={reactionCounts.bot2}
          onReact={sendReaction}
        />
      )}

      {/* Voting */}
      {status === 'voting' && !voted && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
          <h3 className="text-lg font-chakra font-bold text-white mb-2">
            Wie wint?
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Stem op de bot die het beste presteerde
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleVote('bot1')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
            >
              {battle.bot1.botName}
            </button>
            <button
              onClick={() => handleVote('bot2')}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors"
            >
              {battle.bot2.botName}
            </button>
          </div>
          {voteError && (
            <p className="text-sm text-red-400 mt-2">{voteError}</p>
          )}
        </div>
      )}

      {/* Vote results */}
      {(voted || status === 'completed') && (bot1Votes > 0 || bot2Votes > 0) && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <VoteBar
            bot1Votes={bot1Votes}
            bot2Votes={bot2Votes}
            bot1Name={battle.bot1.botName}
            bot2Name={battle.bot2.botName}
          />
        </div>
      )}

      {/* Winner */}
      {status === 'completed' && winnerId && (
        <div className="mt-6 text-center">
          <div className="text-4xl mb-2">
            {winnerId === battle.bot1.botId ? '\uD83C\uDF89' : '\uD83C\uDF89'}
          </div>
          <h2 className="text-2xl font-chakra font-bold text-amber-500">
            {winnerId === battle.bot1.botId
              ? battle.bot1.botName
              : battle.bot2.botName}{' '}
            wint!
          </h2>
          {battle.eloChange > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              +{battle.eloChange} ELO
            </p>
          )}
        </div>
      )}

      {/* Status indicator */}
      {status === 'live' && currentBotModel && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">
            {currentBot} denkt na met {currentBotModel}...
          </p>
        </div>
      )}
    </div>
  );
}
