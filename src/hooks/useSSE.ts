'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { BattleEvent } from '@/lib/types';

export function useSSE(battleId: string | null) {
  const [events, setEvents] = useState<BattleEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const eventsRef = useRef<BattleEvent[]>([]);
  const flushScheduled = useRef(false);

  // Flush buffered events naar React state via requestAnimationFrame
  // Voorkomt dat React bij elke token een volledige re-render doet
  const scheduleFlush = useCallback(() => {
    if (flushScheduled.current) return;
    flushScheduled.current = true;
    requestAnimationFrame(() => {
      setEvents([...eventsRef.current]);
      flushScheduled.current = false;
    });
  }, []);

  useEffect(() => {
    if (!battleId) return;

    eventsRef.current = [];
    setEvents([]);

    const es = new EventSource(`/api/battles/${battleId}/stream`);
    esRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      try {
        const data: BattleEvent = JSON.parse(event.data);
        eventsRef.current.push(data);
        scheduleFlush();
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
  }, [battleId, scheduleFlush]);

  return { events, connected };
}
