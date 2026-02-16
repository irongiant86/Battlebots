// src/lib/elo.ts — ELO rating systeem

import { EloTier } from './types';

const K = 32;

export function calculateEloChange(
  winnerElo: number,
  loserElo: number,
  isDraw: boolean = false
): { winnerChange: number; loserChange: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 - expectedWinner;

  if (isDraw) {
    return {
      winnerChange: Math.round(K * (0.5 - expectedWinner)),
      loserChange: Math.round(K * (0.5 - expectedLoser)),
    };
  }

  return {
    winnerChange: Math.round(K * (1 - expectedWinner)),
    loserChange: Math.round(K * (0 - expectedLoser)),
  };
}

export function getEloTier(elo: number): EloTier {
  if (elo >= 2000) return { name: 'Legendary', color: '#ff3d00', icon: '👑' };
  if (elo >= 1800) return { name: 'Diamond', color: '#00f0ff', icon: '💎' };
  if (elo >= 1600) return { name: 'Platinum', color: '#e5e4e2', icon: '⚡' };
  if (elo >= 1400) return { name: 'Gold', color: '#ffc800', icon: '🏆' };
  if (elo >= 1200) return { name: 'Silver', color: '#c0c0c0', icon: '🥈' };
  return { name: 'Bronze', color: '#cd7f32', icon: '🥉' };
}
