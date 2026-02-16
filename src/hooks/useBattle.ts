'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Battle, BattleEvent, ReactionEmoji } from '@/lib/types';
import { useSSE } from './useSSE';

export function useBattle(battleId: string | null) {
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const { events, connected } = useSSE(battleId);

  // Bot text dat live binnenkomt via tokens
  const [liveText, setLiveText] = useState({ bot1: '', bot2: '' });
  const [currentRound, setCurrentRound] = useState(0);
  const [currentBot, setCurrentBot] = useState('');
  const [currentBotModel, setCurrentBotModel] = useState('');
  const [status, setStatus] = useState<string>('pending');
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [spectatorCount, setSpectatorCount] = useState(0);

  // AI Commentator
  const [liveCommentary, setLiveCommentary] = useState('');

  // Crowd Reactions
  const [reactionCounts, setReactionCounts] = useState({ bot1: 0, bot2: 0 });

  // Intermission countdown
  const [intermission, setIntermission] = useState<{ active: boolean; secondsLeft: number; round: number }>({
    active: false,
    secondsLeft: 0,
    round: 0,
  });
  const intermissionTimer = useRef<NodeJS.Timeout | null>(null);

  // Track hoeveel events we al verwerkt hebben — voorkomt dat gebatchte events verloren gaan
  const lastProcessedIndex = useRef(0);

  // Haal initiële battle data op — inclusief rondes, status, winnerId
  // Zo zien terugkerende kijkers direct alle content, ook zonder SSE events
  useEffect(() => {
    if (!battleId) return;

    fetch(`/api/battles/${battleId}`)
      .then((res) => res.json())
      .then((data) => {
        const b = data.battle;
        setBattle(b);
        if (b) {
          setStatus(b.status || 'pending');
          if (b.currentRound) setCurrentRound(b.currentRound);
          if (b.winnerId) setWinnerId(b.winnerId);
          if (b.reactions) setReactionCounts(b.reactions);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [battleId]);

  // Verwerk SSE events — verwerk ALLE nieuwe events, niet alleen de laatste
  // useSSE batcht meerdere events per requestAnimationFrame; we moeten ze allemaal verwerken
  useEffect(() => {
    if (events.length === 0) {
      lastProcessedIndex.current = 0;
      return;
    }

    // Detecteer reset (nieuw battleId → events array opnieuw opgebouwd)
    if (events.length < lastProcessedIndex.current) {
      lastProcessedIndex.current = 0;
    }

    // Verwerk alle events die we nog niet gezien hebben
    for (let i = lastProcessedIndex.current; i < events.length; i++) {
      const event = events[i];

      switch (event.type) {
        case 'round_start':
          // Stop intermission als een nieuwe ronde start
          if (intermissionTimer.current) {
            clearInterval(intermissionTimer.current);
            intermissionTimer.current = null;
          }
          setIntermission({ active: false, secondsLeft: 0, round: 0 });
          setCurrentRound(event.round);
          setCurrentBot(event.currentBot);
          setCurrentBotModel(event.botModel);
          setStatus('live');
          setLiveCommentary('');
          break;

        case 'token':
          setLiveText((prev) => ({
            ...prev,
            [event.bot]: prev[event.bot] + event.token,
          }));
          break;

        case 'round_complete':
          // Reset live text voor volgende ronde
          setLiveText({ bot1: '', bot2: '' });
          break;

        case 'commentary_token':
          setLiveCommentary((prev) => prev + event.token);
          break;

        case 'commentary':
          setLiveCommentary(event.text);
          break;

        case 'reaction':
          setReactionCounts({ bot1: event.totalBot1, bot2: event.totalBot2 });
          break;

        case 'round_intermission': {
          const totalSec = Math.ceil(event.durationMs / 1000);
          setIntermission({ active: true, secondsLeft: totalSec, round: event.round });

          // Countdown timer
          if (intermissionTimer.current) clearInterval(intermissionTimer.current);
          let remaining = totalSec;
          intermissionTimer.current = setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) {
              if (intermissionTimer.current) clearInterval(intermissionTimer.current);
              intermissionTimer.current = null;
              setIntermission({ active: false, secondsLeft: 0, round: 0 });
            } else {
              setIntermission((prev) => ({ ...prev, secondsLeft: remaining }));
            }
          }, 1000);
          break;
        }

        case 'voting_start':
          setStatus('voting');
          setLiveCommentary('');
          if (intermissionTimer.current) {
            clearInterval(intermissionTimer.current);
            intermissionTimer.current = null;
          }
          setIntermission({ active: false, secondsLeft: 0, round: 0 });
          break;

        case 'battle_complete':
          setStatus('completed');
          setWinnerId(event.winnerId);
          break;

        case 'spectator_count':
          setSpectatorCount(event.count);
          break;
      }
    }

    lastProcessedIndex.current = events.length;
  }, [events]);

  // Cleanup timer bij unmount
  useEffect(() => {
    return () => {
      if (intermissionTimer.current) clearInterval(intermissionTimer.current);
    };
  }, []);

  // Verzamelde rondes: seed vanuit initial battle data + SSE events
  // Zo werkt het zowel bij terugkeren (battle data) als live kijken (SSE events)
  const completedRounds = useMemo(() => {
    const roundMap = new Map<number, {
      round: number;
      bot1Response: string;
      bot2Response: string;
      commentary: string | null;
    }>();

    // Seed vanuit battle data (voor terugkerende kijkers)
    if (battle?.rounds) {
      for (const r of battle.rounds) {
        if (r.bot1Response || r.bot2Response) {
          roundMap.set(r.roundNumber, {
            round: r.roundNumber,
            bot1Response: r.bot1Response || '',
            bot2Response: r.bot2Response || '',
            commentary: r.commentary ?? null,
          });
        }
      }
    }

    // SSE events overschrijven met live data (wint van seed)
    for (const e of events) {
      if (e.type === 'round_complete') {
        roundMap.set(e.round, {
          round: e.round,
          bot1Response: e.bot1Response,
          bot2Response: e.bot2Response,
          commentary: roundMap.get(e.round)?.commentary ?? null,
        });
      } else if (e.type === 'commentary') {
        const round = roundMap.get(e.round);
        if (round) {
          round.commentary = e.text;
        }
      }
    }

    return Array.from(roundMap.values()).sort((a, b) => a.round - b.round);
  }, [battle, events]);

  // Stuur een crowd reaction
  const sendReaction = useCallback(async (emoji: ReactionEmoji, bot: 'bot1' | 'bot2') => {
    if (!battleId) return;
    try {
      await fetch(`/api/battles/${battleId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji, bot }),
      });
    } catch {
      // Silently fail — reacties zijn niet kritiek
    }
  }, [battleId]);

  return {
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
    events,
  };
}
