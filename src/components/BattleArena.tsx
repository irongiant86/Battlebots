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
    intermission,
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

  const isKennismaken = battle.mode === 'kennismaken';
  const roundLabel = isKennismaken ? 'Beurt' : 'Ronde';
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
        <RoundCounter current={currentRound} total={battle.totalRounds} label={isKennismaken ? 'Beurt' : 'Ronde'} />
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
        {/* Bot 1 */}
        <div className={`rounded-xl border overflow-hidden ${
          isKennismaken
            ? 'border-emerald-500/20 bg-emerald-500/5'
            : 'border-blue-500/20 bg-blue-500/5'
        }`}>
          <div className={`p-4 border-b flex items-center gap-3 ${
            isKennismaken ? 'border-emerald-500/10' : 'border-blue-500/10'
          }`}>
            <BotAvatar avatar={battle.bot1.botAvatar} size={48} glowColor={isKennismaken ? '#10b981' : '#2d7aff'} />
            <div className="flex-1 min-w-0">
              <div className={`font-bold truncate ${isKennismaken ? 'text-emerald-400' : 'text-blue-400'}`}>
                {battle.bot1.botName}
              </div>
              <ModelBadge model={battle.bot1.botModel} size="sm" />
            </div>
            {currentBot === battle.bot1.botName && status === 'live' && !intermission.active && (
              <span className={`text-xs animate-pulse ${isKennismaken ? 'text-emerald-400' : 'text-blue-400'}`}>
                {isKennismaken ? 'typt...' : 'denkt na...'}
              </span>
            )}
          </div>
          <div className="p-4 min-h-[200px] max-h-[500px] overflow-y-auto">
            {completedRounds.map((round) => (
              <div key={round.round} className="mb-4">
                <div className={`text-[10px] uppercase tracking-wider mb-1 ${
                  isKennismaken ? 'text-emerald-500/50' : 'text-blue-500/50'
                }`}>
                  {roundLabel} {round.round}
                </div>
                <p className={`text-sm font-mono whitespace-pre-wrap leading-relaxed ${
                  round.bot1Response ? 'text-gray-300' : 'text-gray-600 italic'
                }`}>
                  {round.bot1Response || `${battle.bot1.botName} gaf geen antwoord`}
                </p>
              </div>
            ))}
            {liveText.bot1 && currentRound > 0 && (
              <div>
                <div className={`text-[10px] uppercase tracking-wider mb-1 ${
                  isKennismaken ? 'text-emerald-500/50' : 'text-blue-500/50'
                }`}>
                  {roundLabel} {currentRound}
                </div>
                <TypewriterText
                  text={liveText.bot1}
                  className={isKennismaken ? 'text-emerald-100' : 'text-blue-100'}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bot 2 */}
        <div className={`rounded-xl border overflow-hidden ${
          isKennismaken
            ? 'border-violet-500/20 bg-violet-500/5'
            : 'border-red-500/20 bg-red-500/5'
        }`}>
          <div className={`p-4 border-b flex items-center gap-3 ${
            isKennismaken ? 'border-violet-500/10' : 'border-red-500/10'
          }`}>
            <BotAvatar avatar={battle.bot2.botAvatar} size={48} glowColor={isKennismaken ? '#8b5cf6' : '#ff2d55'} />
            <div className="flex-1 min-w-0">
              <div className={`font-bold truncate ${isKennismaken ? 'text-violet-400' : 'text-red-400'}`}>
                {battle.bot2.botName}
              </div>
              <ModelBadge model={battle.bot2.botModel} size="sm" />
            </div>
            {currentBot === battle.bot2.botName && status === 'live' && !intermission.active && (
              <span className={`text-xs animate-pulse ${isKennismaken ? 'text-violet-400' : 'text-red-400'}`}>
                {isKennismaken ? 'typt...' : 'denkt na...'}
              </span>
            )}
          </div>
          <div className="p-4 min-h-[200px] max-h-[500px] overflow-y-auto">
            {completedRounds.map((round) => (
              <div key={round.round} className="mb-4">
                <div className={`text-[10px] uppercase tracking-wider mb-1 ${
                  isKennismaken ? 'text-violet-500/50' : 'text-red-500/50'
                }`}>
                  {roundLabel} {round.round}
                </div>
                <p className={`text-sm font-mono whitespace-pre-wrap leading-relaxed ${
                  round.bot2Response ? 'text-gray-300' : 'text-gray-600 italic'
                }`}>
                  {round.bot2Response || `${battle.bot2.botName} gaf geen antwoord`}
                </p>
              </div>
            ))}
            {liveText.bot2 && currentRound > 0 && (
              <div>
                <div className={`text-[10px] uppercase tracking-wider mb-1 ${
                  isKennismaken ? 'text-violet-500/50' : 'text-red-500/50'
                }`}>
                  {roundLabel} {currentRound}
                </div>
                <TypewriterText
                  text={liveText.bot2}
                  className={isKennismaken ? 'text-violet-100' : 'text-red-100'}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Intermission — pauze tussen rondes met commentaar + countdown + reacties */}
      {intermission.active && status === 'live' && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">🎙️</span>
              <span className="text-xs text-amber-400 uppercase tracking-wider font-bold">
                {isKennismaken ? 'Tussenpauze' : 'Intermission'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-amber-500/50 flex items-center justify-center">
                <span className="text-xs text-amber-400 font-mono font-bold">
                  {intermission.secondsLeft}
                </span>
              </div>
              <span className="text-[10px] text-amber-500/60">
                Volgende {roundLabel.toLowerCase()} in...
              </span>
            </div>
          </div>

          {/* Commentary */}
          {liveCommentary && (
            <p className="text-sm text-amber-200/90 italic leading-relaxed mb-4">
              {liveCommentary}
            </p>
          )}

          {/* Crowd reactions during intermission */}
          <CrowdReactions
            bot1Name={battle.bot1.botName}
            bot2Name={battle.bot2.botName}
            bot1Count={reactionCounts.bot1}
            bot2Count={reactionCounts.bot2}
            onReact={sendReaction}
          />
        </div>
      )}

      {/* AI Commentator (wanneer nog geen intermission maar wel commentaar) */}
      {liveCommentary && status === 'live' && !intermission.active && (
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

      {/* Completed round commentaries (na afloop) */}
      {completedRounds.some((r) => r.commentary) && (status === 'voting' || status === 'completed') && (
        <div className="mb-6 space-y-2">
          {completedRounds.filter((r) => r.commentary).map((round) => (
            <div key={`commentary-${round.round}`} className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs">🎙️</span>
                <span className="text-[10px] text-amber-500/50 uppercase tracking-wider">
                  Commentaar {roundLabel.toLowerCase()} {round.round}
                </span>
              </div>
              <p className="text-xs text-amber-200/70 italic">
                {round.commentary}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Crowd Reactions (niet-intermission, live battle) */}
      {status === 'live' && !intermission.active && (
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
            {isKennismaken ? 'Wie was de beste gesprekspartner?' : 'Wie wint?'}
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {isKennismaken
              ? 'Stem op de bot die het leukste gesprek voerde'
              : 'Stem op de bot die het beste presteerde'}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleVote('bot1')}
              className={`px-6 py-3 text-white rounded-xl font-medium transition-colors ${
                isKennismaken
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {battle.bot1.botName}
            </button>
            <button
              onClick={() => handleVote('bot2')}
              className={`px-6 py-3 text-white rounded-xl font-medium transition-colors ${
                isKennismaken
                  ? 'bg-violet-600 hover:bg-violet-500'
                  : 'bg-red-600 hover:bg-red-500'
              }`}
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
            {isKennismaken ? '\uD83E\uDD1D' : '\uD83C\uDF89'}
          </div>
          <h2 className="text-2xl font-chakra font-bold text-amber-500">
            {winnerId === battle.bot1.botId
              ? battle.bot1.botName
              : battle.bot2.botName}{' '}
            {isKennismaken ? 'was de beste gesprekspartner!' : 'wint!'}
          </h2>
          {battle.eloChange > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              +{battle.eloChange} ELO
            </p>
          )}
        </div>
      )}

      {/* Status indicator */}
      {status === 'live' && currentBotModel && !intermission.active && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">
            {currentBot} {isKennismaken ? 'typt met' : 'denkt na met'} {currentBotModel}...
          </p>
        </div>
      )}
    </div>
  );
}
