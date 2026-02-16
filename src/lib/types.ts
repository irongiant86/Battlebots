// src/lib/types.ts — Alle TypeScript interfaces voor BotRoyale

// ============================================================
// AI MODEL CONFIGURATIE
// ============================================================

// Ondersteunde AI providers
export type AIProvider = 'anthropic' | 'openai';

// Beschikbare modellen per provider
export type AnthropicModel = 'claude-sonnet-4-20250514' | 'claude-haiku-35-20241022';
export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini';

export type AIModel = AnthropicModel | OpenAIModel;

// Model configuratie met metadata
export interface AIModelConfig {
  id: AIModel;
  provider: AIProvider;
  displayName: string;
  shortName: string;
  description: string;
  maxTokens: number;
  costPerBattle: number; // geschatte kosten in USD
  tier: 'free' | 'standard' | 'premium';
  color: string; // kleur voor UI badge
  icon: string;
}

// Registry van alle beschikbare modellen
export const AI_MODELS: Record<AIModel, AIModelConfig> = {
  'claude-sonnet-4-20250514': {
    id: 'claude-sonnet-4-20250514',
    provider: 'anthropic',
    displayName: 'Claude Sonnet',
    shortName: 'Sonnet',
    description: 'Krachtig en snel — de beste balans tussen kwaliteit en snelheid',
    maxTokens: 512,
    costPerBattle: 0.08,
    tier: 'standard',
    color: '#d97706',
    icon: '⚡',
  },
  'claude-haiku-35-20241022': {
    id: 'claude-haiku-35-20241022',
    provider: 'anthropic',
    displayName: 'Claude Haiku',
    shortName: 'Haiku',
    description: 'Supersnel en goedkoop — ideaal voor snelle battles',
    maxTokens: 512,
    costPerBattle: 0.02,
    tier: 'free',
    color: '#10b981',
    icon: '🌸',
  },
  'gpt-4o': {
    id: 'gpt-4o',
    provider: 'openai',
    displayName: 'GPT-4o',
    shortName: 'GPT-4o',
    description: 'OpenAI\'s sterkste model — concurreer met het beste',
    maxTokens: 512,
    costPerBattle: 0.10,
    tier: 'premium',
    color: '#6366f1',
    icon: '🧠',
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    provider: 'openai',
    displayName: 'GPT-4o Mini',
    shortName: 'GPT-Mini',
    description: 'Snel en betaalbaar alternatief van OpenAI',
    maxTokens: 512,
    costPerBattle: 0.03,
    tier: 'free',
    color: '#8b5cf6',
    icon: '✨',
  },
};

// Helper om modellen per provider op te halen
export function getModelsByProvider(provider: AIProvider): AIModelConfig[] {
  return Object.values(AI_MODELS).filter((m) => m.provider === provider);
}

// Helper om alle modellen als lijst te krijgen
export function getAllModels(): AIModelConfig[] {
  return Object.values(AI_MODELS);
}

// Default model
export const DEFAULT_MODEL: AIModel = 'claude-sonnet-4-20250514';

// ============================================================
// USERS
// ============================================================
export interface User {
  id: string;
  username: string;
  createdAt: Date;
}

// ============================================================
// BOTS — Het hart van het platform
// ============================================================
export interface Bot {
  id: string;
  ownerId: string;
  name: string;
  tagline: string;
  avatar: BotAvatar;
  personality: BotPersonality;

  // AI Model — elk bot kan een ander model gebruiken
  model: AIModel;

  // Stats
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  battlesPlayed: number;
  winStreak: number;
  bestStreak: number;
  fanCount: number;

  // Meta
  createdAt: Date;
  isPublic: boolean;
  isTemplate: boolean;
}

export interface BotPersonality {
  systemPrompt: string;
  style: BotStyle;
  traits: string[];
  catchphrase: string;
}

export type BotStyle =
  | 'aggressive'
  | 'analytical'
  | 'creative'
  | 'diplomatic'
  | 'comedic'
  | 'philosophical'
  | 'streetwise'
  | 'poetic'
  | 'custom';

export interface BotAvatar {
  shape: 'circle' | 'hexagon' | 'diamond' | 'shield' | 'star';
  primaryColor: string;
  secondaryColor: string;
  pattern: 'solid' | 'stripes' | 'dots' | 'circuit' | 'flames';
  expression: 'neutral' | 'angry' | 'smirk' | 'determined' | 'crazy';
}

// ============================================================
// BATTLES
// ============================================================
export interface Battle {
  id: string;
  mode: BattleMode;
  status: BattleStatus;
  challenge: BattleChallenge;

  bot1: BattleParticipant;
  bot2: BattleParticipant;

  rounds: BattleRound[];
  currentRound: number;
  totalRounds: number;

  votes: BattleVote[];
  winnerId: string | null;
  eloChange: number;

  spectatorCount: number;
  startedAt: Date;
  completedAt: Date | null;
}

export type BattleMode = 'debate' | 'creative' | 'roast' | 'puzzle' | 'improv';
export type BattleStatus = 'pending' | 'live' | 'voting' | 'completed';

export interface BattleParticipant {
  botId: string;
  botName: string;
  botAvatar: BotAvatar;
  botModel: AIModel; // welk model deze bot gebruikt
  ownerId: string;
}

export interface BattleRound {
  roundNumber: number;
  bot1Response: string | null;
  bot2Response: string | null;
  bot1RespondedAt: Date | null;
  bot2RespondedAt: Date | null;
  prompt: string;
}

export interface BattleChallenge {
  title: string;
  description: string;
  mode: BattleMode;
  topic?: string;
  task?: string;
  scenario?: string;
}

export interface BattleVote {
  userId: string;
  choice: 'bot1' | 'bot2';
  votedAt: Date;
}

// Battle events voor SSE streaming
export type BattleEvent =
  | { type: 'round_start'; round: number; currentBot: string; botModel: string }
  | { type: 'token'; round: number; bot: 'bot1' | 'bot2'; token: string }
  | { type: 'round_complete'; round: number; bot1Response: string; bot2Response: string }
  | { type: 'battle_complete'; winnerId: string | null }
  | { type: 'spectator_count'; count: number }
  | { type: 'voting_start' }
  | { type: 'error'; message: string };

// ============================================================
// API Request/Response types
// ============================================================
export interface CreateBotRequest {
  name: string;
  tagline: string;
  avatar: BotAvatar;
  personality: BotPersonality;
  model: AIModel;
}

export interface StartBattleRequest {
  bot1Id: string;
  bot2Id: string;
  mode: BattleMode;
  challengeIndex?: number;
}

export interface VoteRequest {
  choice: 'bot1' | 'bot2';
}

// ELO tiers
export interface EloTier {
  name: string;
  color: string;
  icon: string;
}
