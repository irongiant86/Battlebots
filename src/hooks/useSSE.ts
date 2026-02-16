'use client';

import { useState, useEffect, useRef } from 'react';
import { BattleEvent } from '@/lib/types';

export function useSSE(battleId: string | null) {
  const [events, setEvents] = useState<BattleEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!battleId) return;

    const es = new EventSource(`/api/battles/${battleId}/stream`);
    esRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      try {
        const data: BattleEvent = JSON.parse(event.data);
        setEvents((prev) => [...prev, data]);
      } catch {
        // Skip onparseerbare events
      }
    };

    es.onerror = () => {
      setConnected(false);
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [battleId]);

  return { events, connected };
}
