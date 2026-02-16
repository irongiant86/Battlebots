// src/lib/battle-engine.ts — Battle logica per mode met multi-model AI
// Elke bot kan een ander AI model gebruiken (Claude Sonnet, Haiku, GPT-4o, etc.)

import { Battle, BattleEvent, BattleRound, Bot, BattleMode, AI_MODELS } from './types';
import { streamBotResponse } from './ai';
import { store } from './store';
import { calculateEloChange } from './elo';
import { ROUNDS_PER_MODE } from './utils';

type BattleListener = (event: BattleEvent) => void;

class BattleEngine {
  private listeners: Map<string, Set<BattleListener>> = new Map();

  // Registreer een SSE listener voor een battle
  subscribe(battleId: string, listener: BattleListener): () => void {
    if (!this.listeners.has(battleId)) {
      this.listeners.set(battleId, new Set());
    }
    this.listeners.get(battleId)!.add(listener);

    return () => {
      const set = this.listeners.get(battleId);
      if (set) {
        set.delete(listener);
        if (set.size === 0) this.listeners.delete(battleId);
      }
    };
  }

  // Stuur een event naar alle listeners van een battle
  private emit(battleId: string, event: BattleEvent) {
    const set = this.listeners.get(battleId);
    if (set) {
      for (const listener of set) {
        try {
          listener(event);
        } catch {
          // Listener error, skip
        }
      }
    }
  }

  // Start en voer een complete battle uit
  async runBattle(battle: Battle): Promise<void> {
    console.log(`[BattleEngine] Battle starten: ${battle.id} (${battle.mode})`);

    const bot1 = store.getBot(battle.bot1.botId);
    const bot2 = store.getBot(battle.bot2.botId);

    if (!bot1 || !bot2) {
      console.error('[BattleEngine] Bot(s) niet gevonden in store');
      this.emit(battle.id, { type: 'error', message: 'Bot niet gevonden' });
      return;
    }

    console.log(`[BattleEngine] ${bot1.name} (${bot1.model}) vs ${bot2.name} (${bot2.model})`);

    // Update status naar live
    store.updateBattle(battle.id, { status: 'live' });

    try {
      const totalRounds = ROUNDS_PER_MODE[battle.mode] || 3;
      console.log(`[BattleEngine] Totaal rondes: ${totalRounds}`);
      store.updateBattle(battle.id, { totalRounds });

      for (let round = 1; round <= totalRounds; round++) {
        store.updateBattle(battle.id, { currentRound: round });

        const previousRounds = battle.rounds;
        const roundData: BattleRound = {
          roundNumber: round,
          bot1Response: null,
          bot2Response: null,
          bot1RespondedAt: null,
          bot2RespondedAt: null,
          prompt: '',
        };

        // Bepaal welke bot eerst gaat per mode
        if (battle.mode === 'creative' || battle.mode === 'puzzle') {
          // Beide bots tegelijk (geen interactie)
          const [resp1, resp2] = await Promise.all([
            this.executeBotTurn(battle, bot1, 'bot1', round, previousRounds),
            this.executeBotTurn(battle, bot2, 'bot2', round, previousRounds),
          ]);
          roundData.bot1Response = resp1;
          roundData.bot2Response = resp2;
          roundData.bot1RespondedAt = new Date();
          roundData.bot2RespondedAt = new Date();
        } else {
          // Beurtelings: oneven rondes bot1 eerst, even rondes bot2 eerst
          const firstBot = round % 2 === 1 ? 'bot1' : 'bot2';
          const secondBot = firstBot === 'bot1' ? 'bot2' : 'bot1';
          const firstBotObj = firstBot === 'bot1' ? bot1 : bot2;
          const secondBotObj = secondBot === 'bot1' ? bot1 : bot2;

          // Eerste bot
          const resp1 = await this.executeBotTurn(
            battle,
            firstBotObj,
            firstBot,
            round,
            previousRounds
          );
          if (firstBot === 'bot1') {
            roundData.bot1Response = resp1;
            roundData.bot1RespondedAt = new Date();
          } else {
            roundData.bot2Response = resp1;
            roundData.bot2RespondedAt = new Date();
          }

          // Update tussentijds zodat bot 2 de response van bot 1 kan zien
          const updatedRounds = [...previousRounds, { ...roundData }];

          // Tweede bot
          const resp2 = await this.executeBotTurn(
            battle,
            secondBotObj,
            secondBot,
            round,
            updatedRounds
          );
          if (secondBot === 'bot1') {
            roundData.bot1Response = resp2;
            roundData.bot1RespondedAt = new Date();
          } else {
            roundData.bot2Response = resp2;
            roundData.bot2RespondedAt = new Date();
          }
        }

        battle.rounds.push(roundData);
        store.updateBattle(battle.id, { rounds: battle.rounds });

        this.emit(battle.id, {
          type: 'round_complete',
          round,
          bot1Response: roundData.bot1Response || '',
          bot2Response: roundData.bot2Response || '',
        });
      }

      // Battle klaar — ga naar voting
      store.updateBattle(battle.id, { status: 'voting' });
      this.emit(battle.id, { type: 'voting_start' });
    } catch (error) {
      console.error('[BattleEngine] Battle error:', error);
      this.emit(battle.id, {
        type: 'error',
        message: error instanceof Error ? error.message : 'Onbekende fout',
      });
      store.updateBattle(battle.id, { status: 'completed', completedAt: new Date() });
    }
  }

  // Voer een enkele bot turn uit met streaming
  private async executeBotTurn(
    battle: Battle,
    bot: Bot,
    botSide: 'bot1' | 'bot2',
    round: number,
    previousRounds: BattleRound[]
  ): Promise<string> {
    const { system, user } = this.buildRoundPrompt(battle, bot, botSide, round, previousRounds);
    const modelConfig = AI_MODELS[bot.model];

    console.log(`[BattleEngine] Turn: ${bot.name} (${bot.model}) ronde ${round}`);
    console.log(`[BattleEngine] System prompt lengte: ${system.length}, User prompt lengte: ${user.length}`);

    // Emit round start met model info
    this.emit(battle.id, {
      type: 'round_start',
      round,
      currentBot: bot.name,
      botModel: modelConfig.displayName,
    });

    let fullResponse = '';

    try {
      // Stream tokens live naar clients — elk model streamt via dezelfde interface
      for await (const token of streamBotResponse(bot.model, system, user)) {
        fullResponse += token;
        this.emit(battle.id, {
          type: 'token',
          round,
          bot: botSide,
          token,
        });
      }
    } catch (error) {
      console.error(`Fout bij ${bot.model} voor bot ${bot.name}:`, error);
      fullResponse = `[${modelConfig.displayName} kon geen response genereren]`;
    }

    return fullResponse;
  }

  // Bouw de prompt op basis van mode, ronde en geschiedenis
  private buildRoundPrompt(
    battle: Battle,
    bot: Bot,
    botSide: 'bot1' | 'bot2',
    round: number,
    previousRounds: BattleRound[]
  ): { system: string; user: string } {
    const opponentSide = botSide === 'bot1' ? 'bot2' : 'bot1';
    const opponentName =
      botSide === 'bot1' ? battle.bot2.botName : battle.bot1.botName;

    switch (battle.mode) {
      case 'debate':
        return this.buildDebatePrompt(bot, round, battle.challenge.topic || '', previousRounds, opponentSide, opponentName);
      case 'roast':
        return this.buildRoastPrompt(bot, round, opponentName, previousRounds, botSide, opponentSide);
      case 'creative':
        return this.buildCreativePrompt(bot, battle.challenge.task || '');
      case 'puzzle':
        return this.buildPuzzlePrompt(bot, battle.challenge.task || '');
      case 'improv':
        return this.buildImprovPrompt(bot, round, battle.challenge.scenario || '', previousRounds, botSide, opponentSide);
      default:
        return { system: bot.personality.systemPrompt, user: 'Geef een response.' };
    }
  }

  // ============================================================
  // PROMPT BUILDERS PER MODE
  // ============================================================

  private buildDebatePrompt(
    bot: Bot,
    round: number,
    topic: string,
    history: BattleRound[],
    opponentSide: 'bot1' | 'bot2',
    opponentName: string
  ): { system: string; user: string } {
    const totalRounds = ROUNDS_PER_MODE['debate'] || 3;
    const system = `Je bent "${bot.name}". ${bot.personality.systemPrompt}\n\nJe doet mee aan een debat. Wees overtuigend en gebruik je unieke stijl.\n\nBELANGRIJK: Je genereert nu ALLEEN jouw reactie voor deze ene ronde. Schrijf GEEN ronde-nummers, headers of labels. Ga NIET door naar andere rondes. Genereer ÉÉN enkele response en stop daarna.`;

    const prevResponse = this.getLastResponse(history, opponentSide);

    if (round === 1) {
      return {
        system,
        user: `DEBAT TOPIC: "${topic}"\n\n[Ronde ${round} van ${totalRounds}]\n\nDit is je opening statement. Verdedig de stelling met krachtige argumenten. Schrijf ALLEEN je statement voor deze ronde, niets meer. Max 300 woorden.`,
      };
    } else if (round === 2) {
      return {
        system,
        user: `DEBAT TOPIC: "${topic}"\n\n[Ronde ${round} van ${totalRounds}]\n\nJe tegenstander ${opponentName} zei:\n"${prevResponse}"\n\nWeerleg hun argumenten en versterk je eigen positie. Schrijf ALLEEN je reactie voor deze ronde, niets meer. Max 200 woorden.`,
      };
    } else {
      return {
        system,
        user: `DEBAT TOPIC: "${topic}"\n\n[Ronde ${round} van ${totalRounds}]\n\nJe tegenstander ${opponentName} zei:\n"${prevResponse}"\n\nDit is je slotpleidooi. Vat samen waarom jij gelijk hebt. Maak het memorabel. Schrijf ALLEEN je slotpleidooi voor deze ronde, niets meer. Max 150 woorden.`,
      };
    }
  }

  private buildRoastPrompt(
    bot: Bot,
    round: number,
    opponentName: string,
    history: BattleRound[],
    botSide: 'bot1' | 'bot2',
    opponentSide: 'bot1' | 'bot2'
  ): { system: string; user: string } {
    const totalRounds = ROUNDS_PER_MODE['roast'] || 4;
    const system = `Je bent "${bot.name}". ${bot.personality.systemPrompt}\n\nJe staat in een roast battle. Wees grappig en scherp, maar NOOIT haatdragend, racistisch, seksistisch of discriminerend. Humor is je wapen, niet haat.\n\nBELANGRIJK: Je genereert nu ALLEEN jouw reactie voor deze ene ronde. Schrijf GEEN ronde-nummers, headers of labels (zoals "Ronde 1", "Ronde 2"). Ga NIET door naar andere rondes. Genereer ÉÉN enkele response en stop daarna.`;

    const prevResponse = this.getLastResponse(history, opponentSide);

    if (round === 1) {
      return {
        system,
        user: `ROAST BATTLE tegen ${opponentName}!\n\n[Ronde ${round} van ${totalRounds}]\n\nOpen met je beste roast. Wees grappig, scherp en origineel. Schrijf ALLEEN je roast voor deze ronde, niets meer. Max 150 woorden.`,
      };
    } else {
      return {
        system,
        user: `ROAST BATTLE tegen ${opponentName}!\n\n[Ronde ${round} van ${totalRounds}]\n\n${opponentName} zei:\n"${prevResponse}"\n\nKom terug met iets beters! Gebruik callbacks naar wat ze zeiden. Schrijf ALLEEN je roast voor deze ronde, niets meer. Max 150 woorden.`,
      };
    }
  }

  private buildCreativePrompt(
    bot: Bot,
    task: string
  ): { system: string; user: string } {
    return {
      system: `Je bent "${bot.name}". ${bot.personality.systemPrompt}\n\nJe doet mee aan een creatieve wedstrijd. Geef je allerbeste output.`,
      user: `CREATIEVE UITDAGING:\n\n${task}\n\nGeef je beste, meest creatieve output. Dit is je moment om te shinen.`,
    };
  }

  private buildPuzzlePrompt(
    bot: Bot,
    puzzle: string
  ): { system: string; user: string } {
    return {
      system: `Je bent "${bot.name}". ${bot.personality.systemPrompt}\n\nJe doet mee aan een puzzle race. Los het probleem op — snelheid en correctheid tellen.`,
      user: `PUZZEL:\n\n${puzzle}\n\nDenk stap voor stap en geef je antwoord. Wees duidelijk en precies.`,
    };
  }

  private buildImprovPrompt(
    bot: Bot,
    round: number,
    scenario: string,
    history: BattleRound[],
    botSide: 'bot1' | 'bot2',
    opponentSide: 'bot1' | 'bot2'
  ): { system: string; user: string } {
    const totalRounds = ROUNDS_PER_MODE['improv'] || 6;
    const system = `Je bent "${bot.name}". ${bot.personality.systemPrompt}\n\nJe doet mee aan improv theater. Blijf in character, reageer op je medespeler, en houd de scène levendig en grappig.\n\nBELANGRIJK: Je genereert nu ALLEEN jouw reactie voor deze ene ronde. Schrijf GEEN ronde-nummers, headers of labels. Ga NIET door naar andere rondes. Genereer ÉÉN enkele response en stop daarna.`;

    const prevResponse = this.getLastResponse(history, opponentSide);
    const plotTwistRound = 3; // Halverwege

    if (round === 1) {
      return {
        system,
        user: `IMPROV SCÈNE:\n${scenario}\n\n[Ronde ${round} van ${totalRounds}]\n\nBegin de scène. Stel je character voor en start de actie. Schrijf ALLEEN je beurt voor deze ronde, niets meer. Max 150 woorden.`,
      };
    } else if (round === plotTwistRound) {
      return {
        system,
        user: `IMPROV SCÈNE (PLOT TWIST!):\n${scenario}\n\n[Ronde ${round} van ${totalRounds}]\n\nJe medespeler zei:\n"${prevResponse}"\n\nLet op: er is een PLOT TWIST! Verwerk deze in je reactie. Schrijf ALLEEN je beurt voor deze ronde, niets meer. Max 150 woorden.`,
      };
    } else {
      return {
        system,
        user: `IMPROV SCÈNE:\n${scenario}\n\n[Ronde ${round} van ${totalRounds}]\n\nJe medespeler zei:\n"${prevResponse}"\n\nReageer in character. Houd de scène gaande. Schrijf ALLEEN je beurt voor deze ronde, niets meer. Max 150 woorden.`,
      };
    }
  }

  // Haal de laatste response van een bepaalde kant op
  private getLastResponse(
    history: BattleRound[],
    side: 'bot1' | 'bot2'
  ): string {
    if (history.length === 0) return '';
    const lastRound = history[history.length - 1];
    return (side === 'bot1' ? lastRound.bot1Response : lastRound.bot2Response) || '';
  }

  // Verwerk votes en bepaal winnaar
  finalizeBattle(battleId: string): void {
    const battle = store.getBattle(battleId);
    if (!battle || battle.status !== 'voting') return;

    const bot1Votes = battle.votes.filter((v) => v.choice === 'bot1').length;
    const bot2Votes = battle.votes.filter((v) => v.choice === 'bot2').length;

    let winnerId: string | null = null;
    const isDraw = bot1Votes === bot2Votes;

    if (!isDraw) {
      winnerId = bot1Votes > bot2Votes ? battle.bot1.botId : battle.bot2.botId;
    }

    // ELO update
    const bot1 = store.getBot(battle.bot1.botId);
    const bot2 = store.getBot(battle.bot2.botId);

    if (bot1 && bot2) {
      const { winnerChange, loserChange } = calculateEloChange(
        winnerId === bot1.id ? bot1.elo : bot2.elo,
        winnerId === bot1.id ? bot2.elo : bot1.elo,
        isDraw
      );

      if (winnerId === bot1.id) {
        store.updateBot(bot1.id, {
          elo: bot1.elo + winnerChange,
          wins: bot1.wins + 1,
          battlesPlayed: bot1.battlesPlayed + 1,
          winStreak: bot1.winStreak + 1,
          bestStreak: Math.max(bot1.bestStreak, bot1.winStreak + 1),
        });
        store.updateBot(bot2.id, {
          elo: bot2.elo + loserChange,
          losses: bot2.losses + 1,
          battlesPlayed: bot2.battlesPlayed + 1,
          winStreak: 0,
        });
      } else if (winnerId === bot2.id) {
        store.updateBot(bot2.id, {
          elo: bot2.elo + winnerChange,
          wins: bot2.wins + 1,
          battlesPlayed: bot2.battlesPlayed + 1,
          winStreak: bot2.winStreak + 1,
          bestStreak: Math.max(bot2.bestStreak, bot2.winStreak + 1),
        });
        store.updateBot(bot1.id, {
          elo: bot1.elo + loserChange,
          losses: bot1.losses + 1,
          battlesPlayed: bot1.battlesPlayed + 1,
          winStreak: 0,
        });
      } else {
        // Draw
        store.updateBot(bot1.id, {
          elo: bot1.elo + winnerChange,
          draws: bot1.draws + 1,
          battlesPlayed: bot1.battlesPlayed + 1,
          winStreak: 0,
        });
        store.updateBot(bot2.id, {
          elo: bot2.elo + loserChange,
          draws: bot2.draws + 1,
          battlesPlayed: bot2.battlesPlayed + 1,
          winStreak: 0,
        });
      }

      store.updateBattle(battleId, {
        status: 'completed',
        winnerId,
        eloChange: Math.abs(winnerChange),
        completedAt: new Date(),
      });

      this.emit(battleId, { type: 'battle_complete', winnerId });
    }
  }
}

// Singleton
export const battleEngine = new BattleEngine();
