import { Injectable } from '@nestjs/common';
import { BattleState, PokemonState, MoveState, BattleActionPayload } from './battle-state.interface';

@Injectable()
export class BattleService {
  private typeChart: Record<
    string,
    { weak: string[]; resist: string[]; immune?: string[] }
  > = {
      normal: { weak: ['fighting'], resist: [], immune: ['ghost'] },
      fire: {
        weak: ['water', 'ground', 'rock'],
        resist: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
      },
      water: {
        weak: ['electric', 'grass'],
        resist: ['fire', 'water', 'ice', 'steel'],
      },
      electric: { weak: ['ground'], resist: ['electric', 'flying', 'steel'] },
      grass: {
        weak: ['fire', 'ice', 'poison', 'flying', 'bug'],
        resist: ['water', 'electric', 'grass', 'ground'],
      },
      ice: { weak: ['fire', 'fighting', 'rock', 'steel'], resist: ['ice'] },
      fighting: {
        weak: ['flying', 'psychic', 'fairy'],
        resist: ['bug', 'rock', 'dark'],
      },
      poison: {
        weak: ['ground', 'psychic'],
        resist: ['grass', 'fighting', 'poison', 'bug', 'fairy'],
      },
      ground: {
        weak: ['water', 'grass', 'ice'],
        resist: ['poison', 'rock'],
        immune: ['electric'],
      },
      flying: {
        weak: ['electric', 'ice', 'rock'],
        resist: ['grass', 'fighting', 'bug'],
        immune: ['ground'],
      },
      psychic: {
        weak: ['bug', 'ghost', 'dark'],
        resist: ['fighting', 'psychic'],
      },
      bug: {
        weak: ['fire', 'flying', 'rock'],
        resist: ['grass', 'fighting', 'ground'],
      },
      rock: {
        weak: ['water', 'grass', 'fighting', 'ground', 'steel'],
        resist: ['normal', 'fire', 'poison', 'flying'],
      },
      ghost: {
        weak: ['ghost', 'dark'],
        resist: ['poison', 'bug'],
        immune: ['normal', 'fighting'],
      },
      dragon: {
        weak: ['ice', 'dragon', 'fairy'],
        resist: ['fire', 'water', 'electric', 'grass'],
      },
      steel: {
        weak: ['fire', 'fighting', 'ground'],
        resist: [
          'normal',
          'grass',
          'ice',
          'flying',
          'psychic',
          'bug',
          'rock',
          'dragon',
          'steel',
          'fairy',
        ],
        immune: ['poison'],
      },
      dark: {
        weak: ['fighting', 'bug', 'fairy'],
        resist: ['ghost', 'dark'],
        immune: ['psychic'],
      },
      fairy: {
        weak: ['poison', 'steel'],
        resist: ['fighting', 'bug', 'dark'],
        immune: ['dragon'],
      },
    };

  private moves: Record<string, any> = {
    '1': {
      id: '1',
      name: 'Tackle',
      type: 'normal',
      power: 40,
      accuracy: 100,
      category: 'physical',
      currentPp: 35,
      maxPp: 35,
      cooldownDuration: 3000,
    },
    '2': {
      id: '2',
      name: 'Flamethrower',
      type: 'fire',
      power: 90,
      accuracy: 100,
      category: 'special',
      currentPp: 15,
      maxPp: 15,
      cooldownDuration: 5000,
    },
    '3': {
      id: '3',
      name: 'Air Slash',
      type: 'flying',
      power: 75,
      accuracy: 95,
      category: 'special',
      currentPp: 15,
      maxPp: 15,
      cooldownDuration: 5000,
    },
    '4': {
      id: '4',
      name: 'Shadow Ball',
      type: 'ghost',
      power: 80,
      accuracy: 100,
      category: 'special',
      currentPp: 15,
      maxPp: 15,
      cooldownDuration: 5000,
    },
    '5': {
      id: '5',
      name: 'Sludge Bomb',
      type: 'poison',
      power: 90,
      accuracy: 100,
      category: 'special',
      currentPp: 10,
      maxPp: 10,
      cooldownDuration: 10000,
    },
  };

  generateMockTeam(): any[] {
    const pool = this.generatePool(6);
    return pool.slice(0, 3);
  }

  // ... inside BattleService

  generatePool(size: number = 50): PokemonState[] {
    const templates = [
      { id: 6, name: 'Charizard', types: ['fire', 'flying'], stats: { atk: 104, def: 78, spa: 159, spd: 115, spe: 100 } },
      { id: 9, name: 'Blastoise', types: ['water'], stats: { atk: 83, def: 100, spa: 85, spd: 105, spe: 78 } },
      { id: 3, name: 'Venusaur', types: ['grass', 'poison'], stats: { atk: 82, def: 83, spa: 100, spd: 100, spe: 80 } },
      { id: 25, name: 'Pikachu', types: ['electric'], stats: { atk: 55, def: 40, spa: 50, spd: 50, spe: 90 } },
      { id: 94, name: 'Gengar', types: ['ghost', 'poison'], stats: { atk: 65, def: 60, spa: 130, spd: 75, spe: 110 } },
      { id: 68, name: 'Machamp', types: ['fighting'], stats: { atk: 130, def: 80, spa: 65, spd: 85, spe: 55 } },
      { id: 65, name: 'Alakazam', types: ['psychic'], stats: { atk: 50, def: 45, spa: 135, spd: 95, spe: 120 } },
      { id: 76, name: 'Golem', types: ['rock', 'ground'], stats: { atk: 120, def: 130, spa: 55, spd: 65, spe: 45 } },
      { id: 149, name: 'Dragonite', types: ['dragon', 'flying'], stats: { atk: 134, def: 95, spa: 100, spd: 100, spe: 80 } },
      { id: 143, name: 'Snorlax', types: ['normal'], stats: { atk: 110, def: 65, spa: 65, spd: 110, spe: 30 } },
      { id: 59, name: 'Arcanine', types: ['fire'], stats: { atk: 110, def: 80, spa: 100, spd: 80, spe: 95 } },
      { id: 103, name: 'Exeggutor', types: ['grass', 'psychic'], stats: { atk: 95, def: 85, spa: 125, spd: 75, spe: 55 } },
      { id: 121, name: 'Starmie', types: ['water', 'psychic'], stats: { atk: 75, def: 85, spa: 100, spd: 85, spe: 115 } },
      { id: 135, name: 'Jolteon', types: ['electric'], stats: { atk: 65, def: 60, spa: 110, spd: 95, spe: 130 } },
      { id: 112, name: 'Rhydon', types: ['ground', 'rock'], stats: { atk: 130, def: 120, spa: 45, spd: 45, spe: 40 } },
    ];

    const pool: PokemonState[] = [];
    for (let i = 0; i < size; i++) {
      const template = templates[i % templates.length];
      const id = `pool_mon_${i}`;
      pool.push({
        id,
        speciesId: template.id,
        name: template.name, // In real app, make unique names e.g. "Charizard A"
        types: template.types,
        level: 50,
        currentHp: 150, // Simplified HP calc
        maxHp: 150,
        stats: template.stats,
        boosts: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 },
        status: 'none',
        statusTurns: 0,
        moves: [
          { ...this.moves['1'], cooldownDuration: 3000 },
          { ...this.moves['2'], cooldownDuration: 5000 },
          { ...this.moves['3'], cooldownDuration: 5000 }
        ],
        facedPokemonId: null,
      });
    }
    return pool;
  }

  createBattle(matchId: string, p1: any, p2: any, seed: string): BattleState {
    // ... existing battleground logic ...
    const battlegrounds = [
      { name: 'Volcano', boosted: ['fire', 'rock'], penalty: ['ice', 'grass'] },
      { name: 'Ocean', boosted: ['water', 'electric'], penalty: ['fire', 'ground'] },
      { name: 'Forest', boosted: ['grass', 'bug'], penalty: ['rock', 'flying'] },
    ];
    const bgIndex = seed.charCodeAt(0) % battlegrounds.length;
    const bg = battlegrounds[bgIndex];

    // Initial Phase is WAITING unless p2 is CPU
    const initialPhase = p2.userId === 'cpu' ? 'selection' : 'waiting'; // If CPU, go straight to selection (or mock waiting)

    const state: BattleState = {
      matchId,
      turn: 0,
      phase: initialPhase as any, // Cast to any to avoid partial phase issues during dev
      players: {
        [p1.userId]: p1,
        [p2.userId]: p2,
      },
      playerIds: [p1.userId, p2.userId],
      timers: { // Dummy timers
        currentPhaseExpiry: 0,
        selectionDuration: 30000,
        turnDuration: 30000,
      },
      field: {
        weather: 'none',
        terrain: 'none',
        battleground: {
          name: bg.name,
          boostedTypes: bg.boosted,
          penaltyTypes: bg.penalty,
        },
      },
      history: [],
      seed,
      rngCount: 0,
      lastActionTime: {},
    };

    // No auto-start yet, wait for host
    // if (p2.userId === 'cpu') {
    //    this.startReveal(state);
    // }

    return state;
  }

  startReveal(state: BattleState) {
    state.phase = 'reveal';
    const pool = this.generatePool(50);
    state.selection = {
      pool,
      draft: {
        [state.playerIds[0]]: { team: [], selectedIndices: [], ready: false },
        [state.playerIds[1]]: { team: [], selectedIndices: [], ready: false },
      },
      startTime: Date.now(),
      timerDuration: 10000, // 10 seconds reveal
    };
    state.timers.currentPhaseExpiry = Date.now() + 10000;
    state.history.push('Pool Revealed! Scouting for 10 seconds...');
  }

  startSelection(state: BattleState) {
    if (!state.selection) return;

    state.phase = 'selection';

    // Auto-assign 3 locked mons from pool
    const pool = state.selection.pool;

    state.playerIds.forEach(pid => {
      if (state.selection) {
        // Find 3 unique random indices that haven't been picked (though none picked yet)
        // Actually, just pick 3 randoms and mark them as "locked" or just put in team.
        // We need to ensure we don't pick the SAME index twice if we want "draft" feeling?
        // For simple logic: Pick from indices 0-49.

        for (let i = 0; i < 3; i++) {
          let idx;
          do {
            idx = Math.floor(Math.random() * pool.length);
          } while (state.selection.draft[pid].selectedIndices.includes(idx)); // Avoid duplicates for self

          state.selection.draft[pid].team.push(pool[idx]);
          state.selection.draft[pid].selectedIndices.push(idx);
        }
      }
    });

    state.history.push('Selection Phase Started! Draft 3 more Pokemon.');
    state.timers.selectionDuration = 30000;
    state.timers.currentPhaseExpiry = Date.now() + 30000;
  }

  handleDraft(state: BattleState, userId: string, pokemonIndex: number): boolean {
    if (state.phase !== 'selection' || !state.selection) return false;

    const selection = state.selection;
    const draft = selection.draft[userId];
    if (draft.team.length >= 6) return false; // Already full

    const selectedMon = selection.pool[pokemonIndex];
    if (!selectedMon) return false;

    // Check duplications if needed, for now allow duplicates
    draft.team.push(selectedMon);
    draft.selectedIndices.push(pokemonIndex);

    // Check if both ready
    const allReady = state.playerIds.every(id => selection.draft[id].team.length === 6);
    if (allReady) {
      this.startBattle(state);
    }
    return true;
  }

  startBattle(state: BattleState) {
    if (!state.selection) return;

    state.phase = 'battle';
    state.turn = 1;
    state.history.push('Battle Started!');

    // Assign drafted teams to actual players
    state.playerIds.forEach(pid => {
      if (state.selection && state.selection.draft[pid]) {
        state.players[pid].team = state.selection.draft[pid].team;
        if (state.players[pid].team.length > 0) {
          state.players[pid].activePokemonId = state.players[pid].team[0].id;
        }
      }
    });

    state.timers.turnDuration = 10000;
    state.timers.turnExpiry = Date.now() + 10000;
    state.timers.currentPhaseExpiry = Date.now() + 10000;
  }


  checkTimeout(state: BattleState): { timeout: boolean; action?: string; userId?: string } {
    const now = Date.now();

    // 1. Formation Phase (Lead Selection)
    if (state.phase === 'formation') {
      if (now > state.timers.currentPhaseExpiry) {
        // Auto-select first alive pokemon for active slot
        state.playerIds.forEach(pid => {
          const player = state.players[pid];
          if (!player.activePokemonId) {
            const firstAlive = player.team.find(p => p.currentHp > 0);
            if (firstAlive) player.activePokemonId = firstAlive.id;
          }
        });
        this.startBattle(state);
        return { timeout: true, action: 'start_battle' };
      }
    }

    // 2. Fainted Switch Phase
    if (state.phase === 'fainted_switch' && state.faintedState) {
      if (now > state.faintedState.expiry) {
        const pid = state.faintedState.userId;
        const player = state.players[pid];
        const nextMon = player.team.find(p => p.currentHp > 0);
        if (nextMon) {
          player.activePokemonId = nextMon.id;
          state.history.push(`${player.userId} sent out ${nextMon.name}!`);
        }
        // Resume Battle
        state.phase = 'battle';
        delete state.faintedState;
        // Reset AFK timers
        state.playerIds.forEach(id => state.lastActionTime[id] = now);
        return { timeout: true, action: 'auto_switch', userId: pid };
      }
    }

    // 3. Battle Phase AFK Check (20s)
    if (state.phase === 'battle') {
      for (const pid of state.playerIds) {
        const lastAction = state.lastActionTime[pid] || now;
        // 20s AFK Limit
        if (now - lastAction > 20000) {
          return { timeout: true, action: 'timeout', userId: pid };
        }
      }
    }

    // Legacy Phases (Reveal/Selection)
    if (state.phase === 'reveal') {
      if (now > state.timers.currentPhaseExpiry) {
        this.startSelection(state);
        return { timeout: true, action: 'start_selection' };
      }
    }
    if (state.phase === 'selection') {
      if (now > state.timers.currentPhaseExpiry) {
        // Auto-fill rest
        if (state.selection) {
          const pool = state.selection.pool;
          state.playerIds.forEach(pid => {
            if (state.selection) {
              const draft = state.selection.draft[pid];
              while (draft.team.length < 6) {
                let idx;
                let attempts = 0;
                do {
                  idx = Math.floor(Math.random() * pool.length);
                  attempts++;
                } while (draft.selectedIndices.includes(idx) && attempts < 50);
                draft.team.push(pool[idx]);
                draft.selectedIndices.push(idx);
              }
            }
          });
          // Move to Formation Phase instead of Battle
          state.phase = 'formation';
          state.timers.currentPhaseExpiry = now + 10000;
          state.history.push("Choose your lead Pokemon!");
          return { timeout: true, action: 'start_formation' };
        }
      }
    }

    return { timeout: false };
  }

  getTypeEffectiveness(moveType: string, defenderTypes: string[]): number {
    let multiplier = 1.0;
    const typeData = this.typeChart[moveType];
    if (!typeData) return 1.0;

    for (const defType of defenderTypes) {
      if (typeData.weak.includes(defType)) multiplier *= 0.5; // Actually weak means defender resists it? Wait.
      // Standard: "Fire is weak to Water" -> Water hits Fire for 2.0x
      // Data says 'fire': { weak: ['water'] ... }
      // So if I am using Water move against Fire pokemon:
      // My move type is Water. Defender is Fire.
      // Look up 'water' (attacker). Is 'fire' in my 'effective against' list?
      // The chart structure I defined: 'fire': { weak: ['water'] } means Fire is weak to water.

      // So I need to look up the Defender's type.
      const defData = this.typeChart[defType];
      if (defData) {
        if (defData.weak.includes(moveType)) multiplier *= 2.0;
        if (defData.resist.includes(moveType)) multiplier *= 0.5;
        if (defData.immune && defData.immune.includes(moveType))
          multiplier *= 0.0;
      }
    }
    return multiplier;
  }

  // Pure function for damage calculation
  calculateDamage(
    attacker: PokemonState,
    defender: PokemonState,
    move: MoveState,
    field: BattleState['field'],
    _seed: string, // Pass seed for deterministic random factor
  ): { damage: number; isCrit: boolean; effectiveness: number } {
    const moveData = this.moves[move.id] || this.moves['1']; // Fallback to Tackle
    const power = moveData.power;
    const category = moveData.category; // 'physical' or 'special'

    const atk =
      category === 'physical' ? attacker.stats.atk : attacker.stats.spa;
    const def =
      category === 'physical' ? defender.stats.def : defender.stats.spd;

    // 2. Type Effectiveness
    const effectiveness = this.getTypeEffectiveness(
      moveData.type,
      defender.types,
    );

    // 3. Battleground Modifier
    let bgModifier = 1.0;
    if (field.battleground.boostedTypes.includes(moveData.type))
      bgModifier = 1.5;
    if (field.battleground.penaltyTypes.includes(moveData.type))
      bgModifier = 0.8;

    // 4. SATB (Same Type Attack Bonus)
    const stab = attacker.types.includes(moveData.type) ? 1.5 : 1.0;

    // 5. Random Factor (Deterministic)
    // Use seed + turn + attackerId to generate "random" 0.85-1.0
    // Simplified for now
    const randomFactor = 0.95;

    let damage = Math.floor(
      (((2 * attacker.level) / 5 + 2) * power * (atk / def)) / 50 + 2,
    );
    damage = Math.floor(
      damage * bgModifier * stab * effectiveness * randomFactor,
    );

    return { damage, isCrit: false, effectiveness };
  }

  processTurn(state: BattleState, action: any): BattleState {
    const now = Date.now();
    const attackerId = action.userId;

    // Handle Timeouts (Auto-Move / Auto-Switch)
    if (action.type === 'timeout') {
      // AFK Random Move
      const player = state.players[attackerId];
      if (player && player.activePokemonId) {
        const activeMon = player.team.find(p => p.currentHp > 0 && p.id === player.activePokemonId);
        if (activeMon) {
          const availableMoves = activeMon.moves.filter(m => !m.cooldownExpiry || now > m.cooldownExpiry);
          if (availableMoves.length > 0) {
            const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            // Construct synthetic move
            action = { userId: attackerId, action: { type: 'move', moveId: move.id } };
          }
        }
      }
    }
    else if (action.type === 'auto_switch') {
      return state; // Already handled in checkTimeout
    }
    else if (action.type === 'start_formation' || action.type === 'start_battle') {
      return state;
    }


    const opponentId = state.playerIds.find((id) => id !== attackerId);
    if (!opponentId) return state;

    const attackerPlayer = state.players[attackerId];
    const opponentPlayer = state.players[opponentId];

    // Formation Phase Logic
    if (state.phase === 'formation' && action.action?.type === 'all_selected') {
      // ... (Handled by checking ready state, simplified here: just wait for timeout or explicit 'ready')
      return state;
    }

    // Switch Action (during Battle or Fainted)
    if (action.action?.type === 'switch') {
      const targetId = action.action.pokemonId;
      const targetMon = attackerPlayer.team.find(p => p.id === targetId);
      if (targetMon && targetMon.currentHp > 0) {
        attackerPlayer.activePokemonId = targetId;
        state.history.push(`${attackerPlayer.userId} switched to ${targetMon.name}!`);

        // If we were in fainted_switch and this player caused it, resume
        if (state.phase === 'fainted_switch' && state.faintedState?.userId === attackerId) {
          state.phase = 'battle';
          delete state.faintedState;
          // Reset AFK
          state.playerIds.forEach(id => state.lastActionTime[id] = now);
        }
      }
      return state;
    }


    const attackerMon = attackerPlayer.team.find(
      (p) => p.id === attackerPlayer.activePokemonId,
    );
    const defenderMon = opponentPlayer.team.find(
      (p) => p.id === opponentPlayer.activePokemonId,
    );

    if (attackerMon && defenderMon && action.action && action.action.type === 'move') {
      const moveId = action.action.moveId;
      const move = attackerMon.moves.find(m => m.id === moveId);

      // Real-Time Cooldown Check
      if (move && (!move.cooldownExpiry || now >= move.cooldownExpiry)) {
        // Calculate Damage
        const result = this.calculateDamage(
          attackerMon,
          defenderMon,
          move,
          state.field,
          state.matchId + now, // Time-based seed
        );

        defenderMon.currentHp = Math.max(0, defenderMon.currentHp - result.damage);

        let effMsg = '';
        if (result.effectiveness > 1) effMsg = ' It was super effective!';
        if (result.effectiveness < 1 && result.effectiveness > 0) effMsg = ' It was not very effective...';
        if (result.effectiveness === 0) effMsg = ' It had no effect!';

        state.history.push(
          `${attackerMon.name} used ${move.name}! (${result.damage} dmg)${effMsg}`,
        );

        // Set Real-Time Cooldown
        move.cooldownExpiry = now + move.cooldownDuration;

        // Reset AFK Timer for attacker
        if (!state.lastActionTime) state.lastActionTime = {};
        state.lastActionTime[attackerId] = now;

        // Check Faint
        if (defenderMon.currentHp <= 0) {
          state.history.push(`${defenderMon.name} fainted!`);
          const hasAlive = opponentPlayer.team.some(p => p.currentHp > 0);

          if (!hasAlive) {
            state.phase = 'finished';
            state.history.push(`Game Over! ${attackerId} wins!`);
            // Set winner/loser logic here if needed
          } else {
            // Enter Fainted Switch Phase
            state.phase = 'fainted_switch';
            state.faintedState = {
              userId: opponentId,
              expiry: now + 10000 // 10s to switch
            };
            state.history.push(`${opponentId} must switch (10s)!`);
          }
        }
      }
    }

    return state;
  }
}
