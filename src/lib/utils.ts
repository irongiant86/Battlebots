// src/lib/utils.ts — Hulpfuncties

import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  return uuidv4();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Mode display namen
export const MODE_LABELS: Record<string, string> = {
  debate: 'Debate Arena',
  creative: 'Creative Clash',
  roast: 'Roast Battle',
  puzzle: 'Puzzle Race',
  improv: 'Improv Theater',
};

export const MODE_ICONS: Record<string, string> = {
  debate: '\u2694\uFE0F',
  creative: '\uD83C\uDFA8',
  roast: '\uD83D\uDD25',
  puzzle: '\uD83E\uDDE9',
  improv: '\uD83C\uDFAD',
};

// Aantal rondes per mode
export const ROUNDS_PER_MODE: Record<string, number> = {
  debate: 3,
  creative: 1,
  roast: 4,
  puzzle: 1,
  improv: 6,
};

// Tijdformat
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'zojuist';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m geleden`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}u geleden`;
  return `${Math.floor(seconds / 86400)}d geleden`;
}
