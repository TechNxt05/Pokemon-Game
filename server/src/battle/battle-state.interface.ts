export interface MoveState {
  id: string | number;
  name: string;
  type: string;
  power: number;
  accuracy: number;
  category: 'physical' | 'special' | 'status';
  currentPp: number;
  maxPp: number;
  // Real-Time Cooldowns
  cooldownDuration: number; // in ms
  cooldownExpiry?: number; // timestamp
}

export interface PokemonState {
  id: string; // instanceId
  speciesId: number;
  name: string;
  types: string[];

  level: number;
  currentHp: number;
  maxHp: number;

  stats: {
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };

  boosts: {
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
    accuracy: number;
    evasion: number;
  };

  status: 'none' | 'burn' | 'poison' | 'paralysis' | 'freeze' | 'sleep';
  statusTurns: number;

  moves: MoveState[];
  facedPokemonId: string | null; // For validation/trapping
}

export interface PlayerState {
  userId: string;
  team: PokemonState[];
  activePokemonId: string | null;
  sideConditions: any[]; // hazards etc
}

export type BattlePhase = 'waiting_for_players' | 'reveal' | 'selection' | 'formation' | 'battle' | 'fainted_switch' | 'finished';

export interface DraftState {
  team: PokemonState[];
  selectedIndices: number[]; // Indices from the pool
  ready: boolean;
}

export interface BattleState {
  matchId: string;
  turn: number;
  phase: BattlePhase;

  // Real-Time State
  lastActionTime: Record<string, number>; // userId -> timestamp
  faintedState?: {
    userId: string;
    expiry: number;
  };

  players: {
    [userId: string]: PlayerState;
  };

  playerIds: string[]; // [p1, p2] order

  winner?: string; // userId of winner
  scorecard?: {
    [userId: string]: {
      totalDamageDealt: number;
      pokemonsDefeated: number;
    };
  };

  timers: {
    currentPhaseExpiry: number; // Timestamp (ms)
    selectionDuration: number; // 30000 ms
    turnDuration: number; // 30000 ms normally
    turnExpiry?: number;
  };

  field: {
    weather: 'none' | 'sun' | 'rain' | 'sand' | 'hail';
    terrain: 'none' | 'electric' | 'grassy' | 'misty' | 'psychic';
    battleground: {
      name: string;
      boostedTypes: string[]; // 1.5x damage
      penaltyTypes: string[]; // 0.8x damage
    };
  };

  selection?: {
    pool: PokemonState[]; // The shared pool
    draft: Record<string, DraftState>;
    startTime: number;
    timerDuration: number;
  };

  history: string[]; // Log of events

  // Determinism
  seed: string;
  rngCount: number;
}

export interface BattleActionPayload {
  matchId: string;
  userId: string;
  action: {
    type: 'move' | 'switch' | 'draft';
    moveId?: string;
    pokemonId?: string;
    draftIndex?: number;
  };
}
