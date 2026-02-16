'use client';

import { useState, useEffect, useMemo } from 'react';
import { Battle, BattleEvent } from '@/lib/types';
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

  // Haal initiële battle data op
  useEffect(() => {
    if (!battleId) return;

    fetch(`/api/battles/${battleId}`)
      .then((res) => res.json())
      .then((data) => {
        setBattle(data.battle);
        setStatus(data.battle?.status || 'pending');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [battleId]);

  // Verwerk SSE events
  useEffect(() => {
    if (events.length === 0) return;
    const event = events[events.length - 1];

    switch (event.type) {
      case 'round_start':
        setCurrentRound(event.round);
        setCurrentBot(event.currentBot);
        setCurrentBotModel(event.botModel);
        setStatus('live');
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

      case 'voting_start':
        setStatus('voting');
        break;

      case 'battle_complete':
        setStatus('completed');
        setWinnerId(event.winnerId);
        break;

      case 'spectator_count':
        setSpectatorCount(event.count);
        break;
    }
  }, [events]);

  // Verzamelde rondes uit events
  const completedRounds = useMemo(() => {
    return events
      .filter((e): e is Extract<BattleEvent, { type: 'round_complete' }> => e.type === 'round_complete')
      .map((e) => ({
        round: e.round,
        bot1Response: e.bot1Response,
        bot2Response: e.bot2Response,
      }));
  }, [events]);

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
    events,
  };
}
