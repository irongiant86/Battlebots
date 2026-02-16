// src/lib/store.ts — In-memory data store voor MVP
// Wordt vervangen door database in productie

import { User, Bot, Battle, BattleVote } from './types';
import { botTemplates } from './bot-templates';

class Store {
  private users: Map<string, User> = new Map();
  private bots: Map<string, Bot> = new Map();
  private battles: Map<string, Battle> = new Map();
  private sessions: Map<string, string> = new Map(); // sessionId → userId

  constructor() {
    // Laad house bots bij opstarten
    this.initializeTemplates();
  }

  private initializeTemplates() {
    for (const bot of botTemplates) {
      this.bots.set(bot.id, bot);
    }
    // Maak system user voor templates
    const systemUser: User = {
      id: 'system',
      username: 'BotRoyale',
      createdAt: new Date(),
    };
    this.users.set(systemUser.id, systemUser);
  }

  // ============================================================
  // USERS
  // ============================================================
  createUser(id: string, username: string): User {
    const user: User = { id, username, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByUsername(username: string): User | undefined {
    return Array.from(this.users.values()).find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
  }

  // ============================================================
  // SESSIONS
  // ============================================================
  createSession(sessionId: string, userId: string): void {
    this.sessions.set(sessionId, userId);
  }

  getUserIdBySession(sessionId: string): string | undefined {
    return this.sessions.get(sessionId);
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  // ============================================================
  // BOTS
  // ============================================================
  createBot(bot: Bot): Bot {
    this.bots.set(bot.id, bot);
    return bot;
  }

  getBot(id: string): Bot | undefined {
    return this.bots.get(id);
  }

  updateBot(id: string, updates: Partial<Bot>): Bot | undefined {
    const bot = this.bots.get(id);
    if (!bot) return undefined;
    const updated = { ...bot, ...updates };
    this.bots.set(id, updated);
    return updated;
  }

  deleteBot(id: string): boolean {
    return this.bots.delete(id);
  }

  getBotsByOwner(ownerId: string): Bot[] {
    return Array.from(this.bots.values()).filter((b) => b.ownerId === ownerId);
  }

  getPublicBots(): Bot[] {
    return Array.from(this.bots.values()).filter((b) => b.isPublic);
  }

  getTemplateBots(): Bot[] {
    return Array.from(this.bots.values()).filter((b) => b.isTemplate);
  }

  getAllBots(): Bot[] {
    return Array.from(this.bots.values());
  }

  getTopBots(limit: number = 20): Bot[] {
    return Array.from(this.bots.values())
      .filter((b) => b.battlesPlayed > 0)
      .sort((a, b) => b.elo - a.elo)
      .slice(0, limit);
  }

  getBotCount(ownerId: string): number {
    return this.getBotsByOwner(ownerId).filter((b) => !b.isTemplate).length;
  }

  // ============================================================
  // BATTLES
  // ============================================================
  createBattle(battle: Battle): Battle {
    this.battles.set(battle.id, battle);
    return battle;
  }

  getBattle(id: string): Battle | undefined {
    return this.battles.get(id);
  }

  updateBattle(id: string, updates: Partial<Battle>): Battle | undefined {
    const battle = this.battles.get(id);
    if (!battle) return undefined;
    const updated = { ...battle, ...updates };
    this.battles.set(id, updated);
    return updated;
  }

  addVote(battleId: string, vote: BattleVote): boolean {
    const battle = this.battles.get(battleId);
    if (!battle) return false;

    // Check of user al gestemd heeft
    const existing = battle.votes.find((v) => v.userId === vote.userId);
    if (existing) return false;

    battle.votes.push(vote);
    this.battles.set(battleId, battle);
    return true;
  }

  getLiveBattles(): Battle[] {
    return Array.from(this.battles.values())
      .filter((b) => b.status === 'live' || b.status === 'voting')
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  getRecentBattles(limit: number = 20): Battle[] {
    return Array.from(this.battles.values())
      .filter((b) => b.status === 'completed')
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
      .slice(0, limit);
  }

  getBattlesByBot(botId: string): Battle[] {
    return Array.from(this.battles.values())
      .filter((b) => b.bot1.botId === botId || b.bot2.botId === botId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  getAllBattles(): Battle[] {
    return Array.from(this.battles.values())
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }
}

// Singleton instance
export const store = new Store();
